/**
 * Case ID: UT-IPC-167  ·  STATUS: real
 *
 * 责任：资源获取/释放 × 正常释放（supervisor.ts:88）
 * 维度坐标：`stop` × `资源获取/释放` × `正常释放`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-167.md（脚本的唯一依据）
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

describe("UT-IPC-167 · stop · 资源获取/释放 × 正常释放", () => {
  it("releases the child process on stop", async () => {
    await withSupervisor(async ({ supervisor }) => {
      // 步骤 1：spawn（同步取 pid——子进程很快会自行退出）
      supervisor.spawn();
      const pid = (supervisor as unknown as { child: { pid?: number } | null }).child?.pid;

      // 步骤 2：调用 stop()
      await supervisor.stop();

      // 步骤 3：断言子进程引用被清空（进程已被释放）
      expect((supervisor as unknown as { child: unknown }).child).toBeNull();
      expect(typeof pid).toBe("number");
    });
  });
});
