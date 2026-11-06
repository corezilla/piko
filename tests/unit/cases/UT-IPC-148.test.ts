/**
 * Case ID: UT-IPC-148  ·  STATUS: real
 *
 * 责任：参数 `cmd: Command` 的 `每等价类合法值` 类（supervisor.ts:67）
 * 维度坐标：`send` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-148.md（脚本的唯一依据）
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

describe("UT-IPC-148 · send · 纯函数/无副作用 × 每等价类合法值", () => {
  it("sends a command to the running child", async () => {
    await withSupervisor(async ({ supervisor }) => {
      // 步骤 1：spawn（带 facts → 建立 channel）
      supervisor.spawn();
      await wait(200);

      // 步骤 2：调用 send(一条命令)
      // 步骤 3：断言不抛错（命令经 channel 送进子进程）
      expect(() => supervisor.send({ kind: "dispatch" })).not.toThrow();
    }, { facts: true });
  });
});
