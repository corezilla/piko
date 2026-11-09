/**
 * 公共替身：WORKER 单元测试共用。
 *
 * worker.ts 的四个协作者（store / pi / matrix / transfer）都靠注入，
 * 这里给出一套最小可用的替身：真 TaskStore（内存库）、假 Pi、假 Matrix、
 * 假 Transfer，外加一个记录所有 fact 的假 Channel。
 */
import { vi } from "vitest";
import { TaskStore } from "../../../../src/store.js";
import { RunWorker } from "../../../../src/worker.js";
import { Transfer } from "../../../../src/transfer.js";
import type { Fact } from "../../../../src/ipc.js";
import type { RuntimeConfig, TaskRequest } from "../../../../src/types.js";

/** 一条最小可用的任务定义。 */
export const task = (id: string, extra: Partial<TaskRequest> = {}): TaskRequest =>
  ({
    task_id: id,
    instruction: "run",
    workspace_ref: "test",
    permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
    output_paths: [],
    ...extra,
  }) as TaskRequest;

/** WORKER 用的配置：workspace root ＋ staging root。 */
export const config = (root: string, over: Record<string, unknown> = {}) =>
  ({
    workspace: { roots: { test: root }, staging_root: `${root}/staging` },
    transfer: { method: "scp", target_allowlist: [], max_input_bytes: 1024, retry: { max_attempts: 1, base_delay_ms: 0 } },
    ...over,
  }) as unknown as RuntimeConfig;

/** 一个假的 PiRuntime：execute 走给定的实现。 */
export function fakePi(execute: (taskId: string, epoch: number) => Promise<any>) {
  return { execute: vi.fn(execute), close: vi.fn(async () => {}) };
}

/** 一个假的 MatrixRuntime：isJoined 与 sendDiscussionReply 可编排。 */
export function fakeMatrix(over: { joined?: boolean; send?: (...args: any[]) => Promise<any> } = {}) {
  const sent: { run: string; room: string; event: string; turn: number; body: string }[] = [];
  const lost: string[] = [];
  const matrix = {
    sent,
    lost,
    isJoined: vi.fn(async () => over.joined ?? true),
    sendDiscussionReply: vi.fn(async (run: string, room: string, event: string, turn: number, body: string) => {
      sent.push({ run, room, event, turn, body });
      if (over.send) return over.send(run, room, event, turn, body);
      return undefined;
    }),
    recordDiscussionAccessLost: vi.fn((room: string) => {
      lost.push(room);
    }),
    close: vi.fn(async () => {}),
  };
  return matrix;
}

/** 一个假的 Transfer：fetchInputs / deliverArtifacts / clearStaging 可编排。 */
export function fakeTransfer(over: {
  fetchInputs?: (...args: any[]) => Promise<any>;
  deliverArtifacts?: (...args: any[]) => Promise<any>;
} = {}) {
  const cleared: string[] = [];
  const transfer = {
    cleared,
    fetchInputs: vi.fn(async (taskId: string, refs: any[], _signal?: AbortSignal) =>
      over.fetchInputs ? over.fetchInputs(taskId, refs, _signal) : { state: "none", fetched: [], failed: [] },
    ),
    deliverArtifacts: vi.fn(async (taskId: string, outputs: string[], target: any, _signal?: AbortSignal, baseDir?: string) =>
      over.deliverArtifacts ? over.deliverArtifacts(taskId, outputs, target, _signal, baseDir) : { state: "none", delivered: [], failed: [] },
    ),
    clearStaging: vi.fn((taskId: string) => {
      cleared.push(taskId);
    }),
    sshCommandArgs: vi.fn(async () => []),
  };
  return transfer;
}

/**
 * 一个假 Channel：记录每一条 fact，并可按 kind 返回给定的结果。
 *
 * `results` 是 kind → 值的映射；未列出的 kind 返回 `{ ok: true, value: null }`。
 */
export function fakeChannel(results: Record<string, unknown> = {}) {
  const facts: Fact[] = [];
  // A claim that keeps returning the same work would make the worker loop
  // forever; each kind is handed out once unless `repeat` says otherwise.
  const handed = new Set<string>();
  const channel = {
    facts,
    report: vi.fn(async (fact: Fact) => {
      facts.push(fact);
      const once = results[`${fact.kind}:once`];
      if (once !== undefined) {
        if (handed.has(fact.kind)) return { ok: true, value: null };
        handed.add(fact.kind);
        return { ok: true, value: once };
      }
      if (!Object.prototype.hasOwnProperty.call(results, fact.kind)) return { ok: true, value: null };
      return { ok: true, value: results[fact.kind] };
    }),
  };
  return channel;
}

/**
 * 一个「抛错」的 Channel：report 本身抛出异常。
 *
 * 与 rejectingChannel 不同——后者返回 `{ ok: false }`（提交被拒），
 * 这个是通道本身炸了（传输层故障）。
 */
export function throwingChannel(error = "channel exploded") {
  const facts: Fact[] = [];
  const channel = {
    facts,
    report: vi.fn(async (fact: Fact) => {
      facts.push(fact);
      throw new Error(error);
    }),
  };
  return channel;
}

/**
 * 一个「拒绝」的 Channel：每条 fact 的提交都被拒。
 *
 * 用于断言 `report()` 在 fact 未被提交时不得当成已生效。
 */
export function rejectingChannel(error = "rejected by P0") {
  const facts: Fact[] = [];
  const channel = {
    facts,
    report: vi.fn(async (fact: Fact) => {
      facts.push(fact);
      return { ok: false, error };
    }),
  };
  return channel;
}

/**
 * 一次性的 worker 装置：真 store ＋ 假协作者。
 *
 * `claim` 是 store 分配的租约纪元——`run()` 需要它，`publishResult`/`finish`
 * 会被 P0 按纪元围栏校验。
 */
export function workerFixture(options: {
  root: string;
  store: TaskStore;
  task: TaskRequest;
  pi?: ReturnType<typeof fakePi>;
  matrix?: ReturnType<typeof fakeMatrix>;
  transfer?: ReturnType<typeof fakeTransfer>;
  channel?: ReturnType<typeof fakeChannel>;
  owner?: string;
}) {
  const { root, store, task: definition } = options;
  const cfg = config(root);
  store.createOrGet(definition, "slinky", 10);
  const claim = store.tryClaimSlot(options.owner ?? "worker", "boot") as { lease_epoch: number } | null;
  const pi = options.pi ?? fakePi(async () => ({ status: "completed", summary: "done" }));
  const matrix = options.matrix ?? fakeMatrix();
  const transfer = options.transfer ?? fakeTransfer();
  const channel = options.channel ?? fakeChannel();
  const worker = new RunWorker(
    cfg,
    store,
    pi as never,
    matrix as never,
    transfer as never,
    channel as never,
  );
  return { worker, pi, matrix, transfer, channel, claim, cfg };
}
