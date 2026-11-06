/**
 * Case ID: UT-IPC-004  ·  STATUS: real
 *
 * 责任：`report` × `并发/可重入` × `并发对偶/交错`（波次一粗粒度登记）
 * 维度坐标：`report` × `并发/可重入` × `并发对偶/交错`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-004.md（脚本的唯一依据）
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

describe("UT-IPC-004 · report · 并发/可重入 × 并发对偶/交错", () => {
  it("keeps concurrent reports independent", async () => {
    // 步骤 1：构造 store、handler 与 channel
    const store = newStore();
    try {
      const channel = new LocalChannel(new FactHandler(store));

      // 步骤 2：交错地并发 report 两条事实
      const [first, second] = await Promise.all([
        channel.report({ kind: "staging", task_id: "t-1", staging: { state: "ready", fetched: [{ source: "s1" }], failed: [] } }),
        channel.report({ kind: "delivery", task_id: "t-1", delivery: { state: "none", delivered: [{ path: "b", sha256: "x", size_bytes: 1 }], failed: [] } }),
      ]);

      // 步骤 3：断言两条都成功且各自落到自己的事实上（不串扰）
      expect(first.ok).toBe(true);
      expect(second.ok).toBe(true);
      expect(store.inputStaging("t-1").fetched.map((r) => r.source)).toEqual(["s1"]);
      expect(store.getRun("t-1").artifact_delivery.delivered.map((r) => r.path)).toEqual(["b"]);
    } finally {
      store.close();
    }
  });
});
