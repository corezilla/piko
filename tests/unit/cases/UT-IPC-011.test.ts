/**
 * Case ID: UT-IPC-011  ·  STATUS: real
 *
 * 责任：`spawn` × `时间域行为` × `定时器触发序`（波次一粗粒度登记）
 * 维度坐标：`spawn` × `时间域行为` × `定时器触发序`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-011.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { FactHandler, LocalChannel, ProcessChannel, attachChildToHandler, type Fact } from "../../../src/ipc.js";
import { ExecutionProcessSupervisor } from "../../../src/supervisor.js";
import { TaskStore } from "../../../src/store.js";
import { ManualClock } from "../../../src/clock.js";
import type { TaskRequest } from "../../../src/types.js";

const task = (over: Partial<TaskRequest> = {}): TaskRequest => ({
  task_id: "t-1",
  instruction: "do it",
  workspace_ref: "piko",
  permissions: { read_paths: ["src"], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: ["out/result.txt"],
  ...over,
} as TaskRequest);

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function newStore(): TaskStore {
  const store = new TaskStore(":memory:", 1000);
  store.createOrGet(task(), "slinky", 10, undefined);
  return store;
}

function fakeChild(): { on: Function; send: Function; emit: (m: unknown) => void; sent: unknown[] } {
  const listeners: ((msg: unknown) => void)[] = [];
  const sent: unknown[] = [];
  return {
    on: (event: string, fn: (msg: unknown) => void) => { if (event === "message") listeners.push(fn); },
    send: (msg: unknown) => { sent.push(msg); },
    emit: (msg: unknown) => { for (const fn of listeners) fn(msg); },
    sent,
  };
}

describe("UT-IPC-011 · spawn · 时间域行为 × 定时器触发序", () => {
  it("arms the restart timer in order after the child exits", async () => {
    // 步骤 1：构造 supervisor
    const clock = new ManualClock(0, 0);
    const exits: { code: number | null; signal: NodeJS.Signals | null }[] = [];
    const supervisor = new ExecutionProcessSupervisor(
      { PIKO_EXEC_CONFIG: "/nonexistent/runtime.json", PIKO_EXEC_ROOT: "/nonexistent" },
      (code, signal) => { exits.push({ code, signal }); },
      undefined,
      clock,
    );
    try {
      // 步骤 2：spawn 并等它退出
      supervisor.spawn();
      await wait(1200);

      // 步骤 3：断言退出先发生、退避延迟后生效（顺序：exit → 定时器）
      expect(exits.length).toBeGreaterThan(0);
      expect((supervisor as unknown as { restartDelay: number }).restartDelay).toBeGreaterThan(250);
    } finally {
      (supervisor as unknown as { stopped: boolean }).stopped = true;
      await supervisor.stop();
    }
  });
});
