/**
 * Case ID: UT-IPC-160  ·  STATUS: real
 *
 * 责任：纯函数/无副作用 × 每等价类合法值（supervisor.ts:84）
 * 维度坐标：`alive` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-160.md（脚本的唯一依据）
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

describe("UT-IPC-160 · alive · 纯函数/无副作用 × 每等价类合法值", () => {
  it("tracks whether a child exists", async () => {
    await withSupervisor(async ({ supervisor }) => {
      // 步骤 1：断言构造后没有子进程
      expect(supervisor.alive()).toBe(false);

      // 步骤 2：spawn 后立即断言（子进程会在几百毫秒内自行退出，
      //         所以判定必须同步进行）
      supervisor.spawn();
      expect(supervisor.alive()).toBe(true);

      // 步骤 3：kill 后再断言
      supervisor.kill();
      expect(supervisor.alive()).toBe(false);
    });
  });
});
