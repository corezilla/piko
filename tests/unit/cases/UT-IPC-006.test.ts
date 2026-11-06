/**
 * Case ID: UT-IPC-006  ·  STATUS: real
 *
 * 责任：`send` × `并发/可重入` × `并发对偶/交错`（波次一粗粒度登记）
 * 维度坐标：`send` × `并发/可重入` × `并发对偶/交错`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-006.md（脚本的唯一依据）
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

describe("UT-IPC-006 · send · 并发/可重入 × 并发对偶/交错", () => {
  it("does not throw when a command races the child's death", () => {
    // 步骤 1：构造一个没有子进程的 supervisor
    const supervisor = new ExecutionProcessSupervisor({}, () => {}, undefined, new ManualClock());

    // 步骤 2：连续调用 send 两条命令
    // 步骤 3：断言都不抛错（可选链与通道保护）
    expect(() => {
      supervisor.send({ kind: "dispatch" });
      supervisor.send({ kind: "abort", task_id: "t-1" });
    }).not.toThrow();
  });
});
