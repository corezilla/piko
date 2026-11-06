/**
 * Case ID: UT-IPC-076  ·  STATUS: real
 *
 * 责任：分支 L91 ternary : ? task_id :（ipc.ts）
 * 维度坐标：`apply` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-076.md（脚本的唯一依据）
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

describe("UT-IPC-076 · apply · 状态分支 × 合法迁移", () => {
  it("returns null when no task needs staging", () => {
    // 步骤 1：构造空 store 与 handler
    const store = new TaskStore(":memory:", 1000);
    try {
      const handler = new FactHandler(store);

      // 步骤 2：apply 一个 stagingClaim fact
      const outcome = handler.apply({ kind: "stagingClaim" });

      // 步骤 3：断言 value 为 null（没有待取的任务）
      expect(outcome.ok).toBe(true);
      expect(outcome.value).toBeNull();
    } finally {
      store.close();
    }
  });
});
