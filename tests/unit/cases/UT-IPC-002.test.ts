/**
 * Case ID: UT-IPC-002  ·  STATUS: real
 *
 * 责任：`attachChildToHandler` × `资源获取/释放` × `获取失败路径`（波次一粗粒度登记）
 * 维度坐标：`attachChildToHandler` × `资源获取/释放` × `获取失败路径`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-002.md（脚本的唯一依据）
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

describe("UT-IPC-002 · attachChildToHandler · 资源获取/释放 × 获取失败路径", () => {
  it("does not throw when the child's channel is closed", () => {
    // 步骤 1：构造 store、handler 与一个已断开的子进程
    const store = newStore();
    try {
      const child = fakeChild();
      const { send } = attachChildToHandler(child, new FactHandler(store));

      // 步骤 2：让 send 抛 ERR_IPC_CHANNEL_CLOSED（模拟通道已关）
      child.send = () => { throw new Error("Channel closed"); };

      // 步骤 3：断言 send 不抛错——P0 不能因为 P1 死了而崩
      expect(() => send({ kind: "dispatch" })).not.toThrow();
    } finally {
      store.close();
    }
  });
});
