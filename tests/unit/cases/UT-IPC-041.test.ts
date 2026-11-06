/**
 * Case ID: UT-IPC-041  ·  STATUS: real
 *
 * 责任：参数 `child: { on: Function; send?: Function }` 的 `每等价类合法值` 类（ipc.ts:154）
 * 维度坐标：`attachChildToHandler` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-041.md（脚本的唯一依据）
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

describe("UT-IPC-041 · attachChildToHandler · 纯函数/无副作用 × 每等价类合法值", () => {
  it("binds the child and applies an incoming fact", () => {
    // 步骤 1：构造 store、handler 与假子进程
    const store = newStore();
    try {
      const handler = new FactHandler(store);
      const child = fakeChild();
      attachChildToHandler(child, handler);

      // 步骤 2：让子进程发来一条 fact
      child.emit({ ipc: "fact", id: 1, fact: { kind: "staging", task_id: "t-1", staging: { state: "ready", fetched: [], failed: [] } } });

      // 步骤 3：断言 fact 被应用且回了一条 outcome
      expect(store.inputStaging("t-1").state).toBe("ready");
      expect(child.sent).toHaveLength(1);
      expect((child.sent[0] as { ipc: string }).ipc).toBe("outcome");
    } finally {
      store.close();
    }
  });
});
