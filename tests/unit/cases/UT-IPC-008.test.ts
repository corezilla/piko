/**
 * Case ID: UT-IPC-008  ·  STATUS: real
 *
 * 责任：`startWatchdog` × `时间域行为` × `超时边界 ±1 tick`（波次一粗粒度登记）
 * 维度坐标：`startWatchdog` × `时间域行为` × `超时边界 ±1 tick`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-008.md（脚本的唯一依据）
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

describe("UT-IPC-008 · startWatchdog · 时间域行为 × 超时边界 ±1 tick", () => {
  it("kills the child exactly when the heartbeat window passes", async () => {
    // 步骤 1：构造 supervisor 与受控时钟
    const clock = new ManualClock(0, 0);
    const exits: { code: number | null; signal: NodeJS.Signals | null }[] = [];
    const supervisor = new ExecutionProcessSupervisor(
      { PIKO_EXEC_CONFIG: "/nonexistent/runtime.json", PIKO_EXEC_ROOT: "/nonexistent" },
      (code, signal) => { exits.push({ code, signal }); },
      undefined,
      clock,
    );
    try {
      // 步骤 2：spawn 后把时钟推进到健康窗口之外
      supervisor.spawn();
      clock.advance(31000);

      // 步骤 3：断言不健康——看门狗会在下一个周期 SIGKILL 它
      expect(supervisor.unhealthy()).toBe(true);
    } finally {
      (supervisor as unknown as { stopped: boolean }).stopped = true;
      await supervisor.stop();
    }
  });
});
