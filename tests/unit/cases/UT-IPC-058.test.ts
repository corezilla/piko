/**
 * Case ID: UT-IPC-058  ·  STATUS: real
 *
 * 责任：参数 `store` 的 `非法值` 类（ipc.ts:49）
 * 维度坐标：`FactHandler.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-058.md（脚本的唯一依据）
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

describe("UT-IPC-058 · FactHandler.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("passes a store failure through as a failed outcome", () => {
    // 步骤 1：构造空 store 与 handler
    const store = new TaskStore(":memory!", 1000);
    try {
      const handler = new FactHandler(store);

      // 步骤 2：apply 一个 publishResult fact —— 任务不存在，store 抛错
      const outcome = handler.apply({
        kind: "publishResult",
        result: { task_id: "t-1", generation: 1, state: "Completed", partial: false, failure: null, usage: {} as never, published_at: "" } as never,
        lease_epoch: 1,
      });

      // 步骤 3：断言失败且带消息（不抛出）
      expect(outcome.ok).toBe(false);
      expect(outcome.error).toBeDefined();
    } finally {
      store.close();
    }
  });
});
