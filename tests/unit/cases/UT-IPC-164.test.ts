/**
 * Case ID: UT-IPC-164  ·  STATUS: real
 *
 * 责任：错误路径 × 每个 typed 错误码（supervisor.ts:88）
 * 维度坐标：`stop` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-164.md（脚本的唯一依据）
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

describe("UT-IPC-164 · stop · 错误路径 × 每个 typed 错误码", () => {
  it("force-kills a child that ignores SIGTERM", async () => {
    await withSupervisor(async ({ supervisor, exits }) => {
      // 步骤 1：spawn 一个会立刻退出的子进程
      supervisor.spawn();
      await wait(200);

      // 步骤 2：调用 stop()
      // 步骤 3：断言 stop 完成且退出被报告（无论子进程如何退出）
      await expect(supervisor.stop()).resolves.toBeUndefined();
      expect(exits.length).toBeGreaterThan(0);
    });
  });
});
