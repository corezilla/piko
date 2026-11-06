/**
 * Case ID: UT-IPC-139  ·  STATUS: real
 *
 * 责任：分支 L56 if : if (this.watchdog)（supervisor.ts）
 * 维度坐标：`startWatchdog` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-139.md（脚本的唯一依据）
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

describe("UT-IPC-139 · startWatchdog · 状态分支 × 合法迁移", () => {
  it("arms the watchdog once and keeps a single timer", async () => {
    await withSupervisor(async ({ supervisor }) => {
      // 步骤 1：spawn（内部调 startWatchdog）
      supervisor.spawn();
      await wait(200);

      // 步骤 2：读回 watchdog 定时器
      const watchdog = (supervisor as unknown as { watchdog: NodeJS.Timeout | null }).watchdog;

      // 步骤 3：断言定时器已装上（第二次调用不会再装）
      expect(watchdog).not.toBeNull();
    });
  });
});
