/**
 * Case ID: UT-IPC-053  ·  STATUS: real
 *
 * 责任：分支 L157 ?. : msg?.ipc（ipc.ts）
 * 维度坐标：`attachChildToHandler` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-053.md（脚本的唯一依据）
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

describe("UT-IPC-053 · attachChildToHandler · 状态分支 × 合法迁移", () => {
  it("takes the non-fact branch for a message without ipc", () => {
    // 步骤 1：构造 store、handler 与假子进程
    const store = newStore();
    try {
      const child = fakeChild();
      attachChildToHandler(child, new FactHandler(store));

      // 步骤 2：让子进程发来一条没有 ipc 的消息
      child.emit({ foo: "bar" });

      // 步骤 3：断言没有回执（不是 fact 分支）
      expect(child.sent).toHaveLength(0);
    } finally {
      store.close();
    }
  });
});
