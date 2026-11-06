/**
 * Case ID: UT-IPC-001  ·  STATUS: real
 *
 * 责任：`apply` × `错误路径` × `每个 typed 错误码`（波次一粗粒度登记）
 * 维度坐标：`apply` × `错误路径` × `每个 typed 错误码`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-001.md（脚本的唯一依据）
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

describe("UT-IPC-001 · apply · 错误路径 × 每个 typed 错误码", () => {
  it("reports every failure as a typed outcome", () => {
    // 步骤 1：构造空 store 与 handler
    const store = new TaskStore(":memory:", 1000);
    try {
      const handler = new FactHandler(store);

      // 步骤 2：apply 一条会失败的事实与一条未知的事实
      const failed = handler.apply({ kind: "staging", task_id: "missing", staging: { state: "ready", fetched: [], failed: [] } });
      const unknown = handler.apply({ kind: "nope" } as unknown as Fact);

      // 步骤 3：断言两者都返回失败且带错误消息（不抛出）
      expect(failed.ok).toBe(false);
      expect(failed.error).toBeTruthy();
      expect(unknown.ok).toBe(false);
      expect(unknown.error).toContain("unknown fact");
    } finally {
      store.close();
    }
  });
});
