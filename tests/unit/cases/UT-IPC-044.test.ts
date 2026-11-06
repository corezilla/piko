/**
 * Case ID: UT-IPC-044  ·  STATUS: real
 *
 * 责任：可选参数 `onCommand` 缺省/显式两态（ipc.ts:154）
 * 维度坐标：`attachChildToHandler` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-044.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { FactHandler, attachChildToHandler, type Fact } from "../../../src/ipc.js";
import { TaskStore } from "../../../src/store.js";
import type { TaskRequest } from "../../../src/types.js";

const task = (over: Partial<TaskRequest> = {}): TaskRequest => ({
  task_id: "t-1",
  instruction: "do it",
  workspace_ref: "piko",
  permissions: { read_paths: ["src"], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: ["out/result.txt"],
  ...over,
} as TaskRequest);

function newStore(): TaskStore {
  const store = new TaskStore(":memory:", 1000);
  store.createOrGet(task(), "slinky", 10, undefined);
  return store;
}

/** 一个假子进程：能收消息、能回消息。 */
function fakeChild(): { on: Function; send: Function; emit: (msg: unknown) => void; sent: unknown[] } {
  const listeners: ((msg: unknown) => void)[] = [];
  const sent: unknown[] = [];
  return {
    on: (event: string, fn: (msg: unknown) => void) => { if (event === "message") listeners.push(fn); },
    send: (msg: unknown) => { sent.push(msg); },
    emit: (msg: unknown) => { for (const fn of listeners) fn(msg); },
    sent,
  };
}

describe("UT-IPC-044 · attachChildToHandler · 纯函数/无副作用 × 每等价类合法值", () => {
  it("routes a command to the handler when one is given", () => {
    // 步骤 1：构造记录命令的 onCommand
    const commands: unknown[] = [];
    const store = newStore();
    try {
      const child = fakeChild();
      attachChildToHandler(child, new FactHandler(store), (cmd) => { commands.push(cmd); });

      // 步骤 2：让子进程发来一条 command
      child.emit({ ipc: "command", command: { kind: "abort", task_id: "t-1" } });

      // 步骤 3：断言回调收到该命令
      // 当前实况（G-UT-IPC-1）：attachChildToHandler 把整条消息交给 onCommand，
      // 而 ProcessChannel 交的是剥出来的命令——两条路径形状不一致
      expect(commands).toEqual([{ ipc: "command", command: { kind: "abort", task_id: "t-1" } }]);
    } finally {
      store.close();
    }
  });
});
