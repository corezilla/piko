/**
 * Case ID: UT-IPC-171  ·  STATUS: real
 *
 * 责任：`spawn` × `状态分支` × `合法迁移`（波次一粗粒度登记）
 * 维度坐标：`spawn` × `状态分支` × `合法迁移`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-171.md（脚本的唯一依据）
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

describe("UT-IPC-171 · spawn · 状态分支 × 合法迁移", () => {
  it("keeps the restart delay within the 5s cap", async () => {
    const clock = new ManualClock(0, 0);
    const supervisor = new ExecutionProcessSupervisor({}, () => {}, undefined, clock);
    try {
      // 步骤 1：把延迟调到上限
      (supervisor as unknown as { restartDelay: number }).restartDelay = 4000;

      // 步骤 2：spawn 让它退出一次（退避加倍）
      supervisor.spawn();
      await wait(1200);

      // 步骤 3：断言延迟被封顶在 5000
      expect((supervisor as unknown as { restartDelay: number }).restartDelay).toBeLessThanOrEqual(5000);
    } finally {
      (supervisor as unknown as { stopped: boolean }).stopped = true;
      await supervisor.stop();
    }
  });});
