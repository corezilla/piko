/**
 * Case ID: UT-IPC-135  ·  STATUS: real
 *
 * 责任：资源 fork（supervisor.ts）
 * 维度坐标：`spawn` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-135.md（脚本的唯一依据）
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

describe("UT-IPC-135 · spawn · 资源获取/释放 × 获取失败路径", () => {
  it("forks a child process", async () => {
    await withSupervisor(async ({ supervisor }) => {
      // 步骤 1：spawn
      supervisor.spawn();

      // 步骤 2：断言子进程被 fork 出来（child 有 pid）
      const child = (supervisor as unknown as { child: { pid?: number } | null }).child;
      expect(child).not.toBeNull();
      expect(typeof child?.pid).toBe("number");
    });
  });
});
