/**
 * Case ID: UT-IPC-003  ·  STATUS: real
 *
 * 责任：`kill` × `资源获取/释放` × `获取失败路径`（波次一粗粒度登记）
 * 维度坐标：`kill` × `资源获取/释放` × `获取失败路径`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-003.md（脚本的唯一依据）
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

describe("UT-IPC-003 · kill · 资源获取/释放 × 获取失败路径", () => {
  it("does not throw when there is no child to kill", () => {
    // 步骤 1：构造一个没有子进程的 supervisor
    const supervisor = new ExecutionProcessSupervisor({}, () => {}, undefined, new ManualClock());

    // 步骤 2：调用 kill()
    // 步骤 3：断言不抛错（没有子进程不是错误）
    expect(() => supervisor.kill()).not.toThrow();
    expect(supervisor.alive()).toBe(false);
  });
});
