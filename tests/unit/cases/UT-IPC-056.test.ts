/**
 * Case ID: UT-IPC-056  ·  STATUS: real
 *
 * 责任：参数 `store: TaskStore` 的 `每等价类合法值` 类（ipc.ts:49）
 * 维度坐标：`FactHandler.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-056.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { FactHandler, type Fact } from "../../../src/ipc.js";
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

describe("UT-IPC-056 · FactHandler.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("binds the store and applies facts to it", () => {
    // 步骤 1：构造 store 与 handler
    const store = newStore();
    try {
      const handler = new FactHandler(store);

      // 步骤 2：apply 一个 staging fact
      const outcome = handler.apply({ kind: "staging", task_id: "t-1", staging: { state: "ready", fetched: [], failed: [] } });

      // 步骤 3：断言写入落进绑定的 store
      expect(outcome.ok).toBe(true);
      expect(store.inputStaging("t-1").state).toBe("ready");
    } finally {
      store.close();
    }
  });
});
