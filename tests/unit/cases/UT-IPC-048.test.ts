/**
 * Case ID: UT-IPC-048  ·  STATUS: real
 *
 * 责任：参数 `onCommand: (cmd: Command) => void` 的 `每等价类合法值` 类（ipc.ts:154）
 * 维度坐标：`attachChildToHandler` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-048.md（脚本的唯一依据）
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

describe("UT-IPC-048 · attachChildToHandler · 纯函数/无副作用 × 每等价类合法值", () => {
  it("forwards a command to the child", () => {
    // 步骤 1：构造 store、handler 与假子进程
    const store = newStore();
    try {
      const child = fakeChild();
      const { send } = attachChildToHandler(child, new FactHandler(store));

      // 步骤 2：调用 send(一条命令)
      send({ kind: "shutdown" });

      // 步骤 3：断言命令被送到子进程
      expect(child.sent).toEqual([{ ipc: "command", command: { kind: "shutdown" } }]);
    } finally {
      store.close();
    }
  });});
