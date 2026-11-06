/**
 * Case ID: UT-IPC-155  ·  STATUS: real
 *
 * 责任：参数 `windowMs: number` 的 `+1 拒绝` 类（supervisor.ts:80）
 * 维度坐标：`unhealthy` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-155.md（脚本的唯一依据）
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

describe("UT-IPC-155 · unhealthy · 数值/长度上限参数 × +1 拒绝", () => {
  it("is true once the heartbeat window passes", async () => {
    await withSupervisor(async ({ supervisor, clock }) => {
      // 步骤 1：spawn 后把时钟推进 31 秒
      supervisor.spawn();
      clock.advance(31000);

      // 步骤 2：调用 unhealthy()
      // 步骤 3：断言为真（心跳过期）
      expect(supervisor.unhealthy()).toBe(true);
    });
  });});
