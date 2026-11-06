/**
 * Case ID: UT-IPC-166  ·  STATUS: real
 *
 * 责任：分支 L95（stop 的定时器清理）
 * 维度坐标：`stop` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-166.md（脚本的唯一依据）
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

describe("UT-IPC-166 · stop · 状态分支 × 合法迁移", () => {
  it("does not restart after stop", async () => {
    await withSupervisor(async ({ supervisor, exits }) => {
      // 步骤 1：spawn 后立刻 stop
      supervisor.spawn();
      await supervisor.stop();
      const count = exits.length;

      // 步骤 2：等超过重启延迟
      await wait(800);

      // 步骤 3：断言没有新的退出（stopped 阻断了重启）
      expect(exits.length).toBe(count);
    });
  });
});
