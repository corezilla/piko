/**
 * Case ID: UT-IPC-095  ·  STATUS: real
 *
 * 责任：返回站点 L91 值 （ipc.ts）
 * 维度坐标：`apply` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-095.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { FactHandler, ProcessChannel, attachChildToHandler, type Fact } from "../../../src/ipc.js";
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

const USAGE = {
  source: "PiModelResponses", quality: "Complete",
  input_tokens: 0, output_tokens: 0, total_tokens: 0,
  cache_read_tokens: 0, cache_write_tokens: 0, reasoning_tokens: 0,
  model_attempts: 0, usage_observed_attempts: 0, missing_fields: [],
};

function newStore(): TaskStore {
  const store = new TaskStore(":memory:", 1000);
  store.createOrGet(task(), "slinky", 10, undefined);
  return store;
}

describe("UT-IPC-095 · apply · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the staging claim with its task id", () => {
    const store = newStore();
    try {
      const handler = new FactHandler(store);
      // 步骤 1b：把任务的 staging 状态置为 pending——只有 pending 的任务会被认领
      store.setInputStaging("t-1", { state: "pending", fetched: [], failed: [] });

      // 步骤 2：apply 一个 stagingClaim fact
      const outcome = handler.apply({ kind: "stagingClaim" });

      // 步骤 3：断言返回带 task_id 的认领
      expect(outcome.ok).toBe(true);
      expect(outcome.value).toHaveProperty("task_id");
    } finally {
      store.close();
    }
  });});
