/**
 * Case ID: UT-IPC-158  ·  STATUS: real
 *
 * 责任：时间域行为 × 超时边界 ±1 tick（supervisor.ts:80）
 * 维度坐标：`unhealthy` × `时间域行为` × `超时边界 ±1 tick`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-158.md（脚本的唯一依据）
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

describe("UT-IPC-158 · unhealthy · 时间域行为 × 超时边界 ±1 tick", () => {
  it("switches exactly at the window boundary", async () => {
    await withSupervisor(async ({ supervisor, clock }) => {
      // 步骤 1：spawn 后把时钟推进到窗口边界
      supervisor.spawn();
      clock.advance(30000);

      // 步骤 2：调用 unhealthy()
      // 步骤 3：断言边界值（now - lastHeartbeat > windowMs 为假）
      expect(supervisor.unhealthy()).toBe(false);

      // 步骤 4：再推进 1ms，断言越过边界后为真
      clock.advance(1);
      expect(supervisor.unhealthy()).toBe(true);
    });
  });
});
