/**
 * Case ID: UT-IPC-005  ·  STATUS: real
 *
 * 责任：`runExecutionProcess` × `资源获取/释放` × `获取失败路径`（波次一粗粒度登记）
 * 维度坐标：`runExecutionProcess` × `资源获取/释放` × `获取失败路径`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-005.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { FactHandler, LocalChannel, ProcessChannel, attachChildToHandler, type Fact } from "../../../src/ipc.js";
import { ExecutionProcessSupervisor } from "../../../src/supervisor.js";
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

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function newStore(): TaskStore {
  const store = new TaskStore(":memory:", 1000);
  store.createOrGet(task(), "slinky", 10, undefined);
  return store;
}

function fakeChild(): { on: Function; send: Function; emit: (m: unknown) => void; sent: unknown[] } {
  const listeners: ((msg: unknown) => void)[] = [];
  const sent: unknown[] = [];
  return {
    on: (event: string, fn: (msg: unknown) => void) => { if (event === "message") listeners.push(fn); },
    send: (msg: unknown) => { sent.push(msg); },
    emit: (msg: unknown) => { for (const fn of listeners) fn(msg); },
    sent,
  };
}

describe("UT-IPC-005 · runExecutionProcess · 资源获取/释放 × 获取失败路径", () => {
  it("fails to start without a configuration", async () => {
    // 步骤 1：调用 runExecutionProcess —— 指向不存在的配置
    const { runExecutionProcess } = await import("../../../src/exec-process.js");

    // 步骤 2：断言在 5 秒内失败（配置读不到时不得留下半启动的进程）
    //         ——用竞速包住：配置不存在，loadConfig 立刻以 ENOENT 拒绝
    const started = Date.now();
    await expect(
      Promise.race([
        runExecutionProcess("/nonexistent/runtime.json", "/nonexistent"),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timed out")), 5000)),
      ]),
    ).rejects.toThrow();
    expect(Date.now() - started).toBeLessThan(5000);
  });
});
