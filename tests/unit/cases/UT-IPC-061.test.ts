/**
 * Case ID: UT-IPC-061  ·  STATUS: real
 *
 * 责任：参数 `fact` 的 `非法值` 类（ipc.ts:50）
 * 维度坐标：`apply` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-061.md（脚本的唯一依据）
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

describe("UT-IPC-061 · apply · 纯函数/无副作用 × 每等价类合法值", () => {
  it("reports an unknown fact kind as failed", () => {
    // 步骤 1：构造 store 与 handler
    const store = newStore();
    try {
      const handler = new FactHandler(store);

      // 步骤 2：apply 一个未知 kind 的 fact
      const outcome = handler.apply({ kind: "nope" } as unknown as Fact);

      // 步骤 3：断言失败且消息逐值指出未知 kind
      expect(outcome.ok).toBe(false);
      expect(outcome.error).toBe("unknown fact nope");
    } finally {
      store.close();
    }
  });
});
