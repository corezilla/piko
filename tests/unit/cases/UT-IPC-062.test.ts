/**
 * Case ID: UT-IPC-062  ·  STATUS: real
 *
 * 责任：分支 case "staging"（ipc.ts）
 * 维度坐标：`apply` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-062.md（脚本的唯一依据）
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

describe("UT-IPC-062 · apply · 状态分支 × 合法迁移", () => {
  it("applies a staging fact to the store", () => {
    // 步骤 1：构造 store 与 handler
    const store = newStore();
    try {
      const handler = new FactHandler(store);

      // 步骤 2：apply 一个 staging fact
      const outcome = handler.apply({ kind: "staging", task_id: "t-1", staging: { state: "ready", fetched: [{ source: "s1" }], failed: [] } });

      // 步骤 3：断言写入落库且返回成功
      expect(outcome.ok).toBe(true);
      expect(store.inputStaging("t-1").fetched.map((r) => r.source)).toEqual(["s1"]);
    } finally {
      store.close();
    }
  });});
