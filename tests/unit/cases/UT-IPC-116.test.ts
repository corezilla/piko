/**
 * Case ID: UT-IPC-116  ·  STATUS: real
 *
 * 责任：分支 L36 `heartbeat`（supervisor.ts）
 * 维度坐标：`spawn` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-116.md（脚本的唯一依据）
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

describe("UT-IPC-116 · spawn · 状态分支 × 合法迁移", () => {
  it("updates the heartbeat baseline on a heartbeat message", async () => {
    await withSupervisor(async ({ supervisor, clock }) => {
      // 步骤 1：spawn
      supervisor.spawn();
      clock.advance(60000);

      // 步骤 2：向子进程发一条心跳消息（走 child 的 message 通道）
      const child = (supervisor as unknown as { child: { emit: (e: string, m: unknown) => void } }).child;
      child.emit("message", { type: "heartbeat" });

      // 步骤 3：断言心跳被记下（时钟推进后仍健康）
      expect(supervisor.unhealthy()).toBe(false);
    });
  });});
