/**
 * Case ID: UT-IPC-012  ·  STATUS: real
 *
 * 责任：`apply` × `状态分支` × `每个非法迁移拒绝`（波次一粗粒度登记）
 * 维度坐标：`apply` × `状态分支` × `每个非法迁移拒绝`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-012.md（脚本的唯一依据）
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

describe("UT-IPC-012 · apply · 状态分支 × 每个非法迁移拒绝", () => {
  it("refuses facts whose task or contract does not exist", () => {
    // 步骤 1：构造空 store 与 handler
    const store = new TaskStore(":memory:", 1000);
    try {
      const handler = new FactHandler(store);

      // 步骤 2：apply 一条指向未知任务的事实
      const outcome = handler.apply({ kind: "staging", task_id: "ghost", staging: { state: "ready", fetched: [], failed: [] } });

      // 步骤 3：断言被拒（非法迁移不落地）
      expect(outcome.ok).toBe(false);
      expect(outcome.error).toContain("unknown task");
    } finally {
      store.close();
    }
  });
});
