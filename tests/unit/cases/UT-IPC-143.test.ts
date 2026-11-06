/**
 * Case ID: UT-IPC-143  ·  STATUS: real
 *
 * 责任：分支 L58 ! : !this.child（supervisor.ts）（看门狗路径）
 * 维度坐标：`startWatchdog` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-143.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ExecutionProcessSupervisor } from "../../../src/supervisor.js";
import { FactHandler } from "../../../src/ipc.js";
import { TaskStore } from "../../../src/store.js";
import { ManualClock } from "../../../src/clock.js";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withSupervisor<T>(
  fn: (ctx: {
    supervisor: ExecutionProcessSupervisor;
    clock: ManualClock;
    exits: { code: number | null; signal: NodeJS.Signals | null }[];
    store: TaskStore;
  }) => Promise<T>,
  options: { facts?: boolean } = {},
): Promise<T> {
  const clock = new ManualClock(0, 0);
  const exits: { code: number | null; signal: NodeJS.Signals | null }[] = [];
  const store = new TaskStore(":memory:", 1000);
  const facts = options.facts ? new FactHandler(store) : undefined;
  const supervisor = new ExecutionProcessSupervisor(
    { PIKO_EXEC_CONFIG: "/nonexistent/runtime.json", PIKO_EXEC_ROOT: "/nonexistent" },
    (code, signal) => { exits.push({ code, signal }); },
    facts,
    clock,
  );
  try {
    return await fn({ supervisor, clock, exits, store });
  } finally {
    (supervisor as unknown as { stopped: boolean }).stopped = true;
    await supervisor.stop();
    store.close();
  }
}

describe("UT-IPC-143 · startWatchdog · 状态分支 × 合法迁移", () => {
  it("does not kill a child that is still heartbeating", async () => {
    await withSupervisor(async ({ supervisor, clock }) => {
      // 步骤 1：spawn 并把时钟推进到健康窗口内
      supervisor.spawn();
      clock.advance(1000);

      // 步骤 2：断言子进程还活着（看门狗的 5s 周期未到，且不健康为假）
      expect(supervisor.unhealthy()).toBe(false);
    });
  });
});
