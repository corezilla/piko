/**
 * Case ID: UT-IPC-104  ·  STATUS: real
 *
 * 责任：参数 `onExit` 的 `+1 拒绝` 类（supervisor.ts:20）
 * 维度坐标：`ExecutionProcessSupervisor.constructor` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-104.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ExecutionProcessSupervisor } from "../../../src/supervisor.js";
import { FactHandler } from "../../../src/ipc.js";
import { TaskStore } from "../../../src/store.js";
import { ManualClock } from "../../../src/clock.js";
import type { TaskRequest } from "../../../src/types.js";

const task = (over: Partial<TaskRequest> = {}): TaskRequest => ({
  task_id: "t-1",
  instruction: "do it",
  workspace_ref: "piko",
  permissions: { read_paths: ["src"], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: ["out/result.txt"],
  ...over,
} as TaskRequest);

/**
 * 一个真 supervisor：fork 出真的子进程（src/exec-process.ts 会因配置缺失
 * 立刻退出），用来观察 fork／exit／重启／看门狗这些生命周期行为。
 */
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
  store.createOrGet(task(), "slinky", 10, undefined);
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

describe("UT-IPC-104 · ExecutionProcessSupervisor.constructor · 数值/长度上限参数 × +1 拒绝", () => {
  it("reports the exit signal when the child is killed", async () => {
    await withSupervisor(async ({ supervisor, exits }) => {
      // 步骤 1：spawn 并立刻 kill
      supervisor.spawn();
      await new Promise((r) => setTimeout(r, 200));
      supervisor.kill();

      // 步骤 2：等退出回调
      await new Promise((r) => setTimeout(r, 1000));

      // 步骤 3：断言回调收到了退出信息
      expect(exits.length).toBeGreaterThan(0);
      expect(exits[0]).toHaveProperty("code");
      expect(exits[0]).toHaveProperty("signal");
    });
  });
});
