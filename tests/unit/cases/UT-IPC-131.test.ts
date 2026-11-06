/**
 * Case ID: UT-IPC-131  ·  STATUS: real
 *
 * 责任：状态写 L37 → `this.lastHeartbeat`（supervisor.ts）
 * 维度坐标：`spawn` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-131.md（脚本的唯一依据）
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

describe("UT-IPC-131 · spawn · 状态分支 × 合法迁移", () => {
  it("refreshes the heartbeat on a heartbeat message", async () => {
    await withSupervisor(async ({ supervisor, clock }) => {
      // 步骤 1：spawn 后推进时钟
      supervisor.spawn();
      clock.advance(1000);
      const child = (supervisor as unknown as { child: { emit: (e: string, m: unknown) => void } }).child;

      // 步骤 2：发一条心跳
      child.emit("message", { type: "heartbeat" });

      // 步骤 3：断言 lastHeartbeat 被刷新到当前时刻
      expect((supervisor as unknown as { lastHeartbeat: number }).lastHeartbeat).toBe(1000);
    });
  });});
