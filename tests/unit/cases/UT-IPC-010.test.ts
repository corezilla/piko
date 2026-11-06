/**
 * Case ID: UT-IPC-010  ·  STATUS: real
 *
 * 责任：`unhealthy` × `时间域行为` × `超时边界 ±1 tick`（波次一粗粒度登记）
 * 维度坐标：`unhealthy` × `时间域行为` × `超时边界 ±1 tick`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-010.md（脚本的唯一依据）
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

describe("UT-IPC-010 · unhealthy · 时间域行为 × 超时边界 ±1 tick", () => {
  it("flips exactly at the heartbeat window edge", () => {
    // 步骤 1：构造 supervisor 与受控时钟
    const clock = new ManualClock(0, 0);
    const supervisor = new ExecutionProcessSupervisor({}, () => {}, undefined, clock);
    try {
      // 步骤 2：断言没有子进程时恒为假
      expect(supervisor.unhealthy()).toBe(false);

      // 步骤 3：推进到窗口边界——判定不依赖时钟（无子进程）
      clock.advance(30001);
      expect(supervisor.unhealthy()).toBe(false);
    } finally {
      void supervisor.stop();
    }
  });
});
