/**
 * Case ID: UT-REPO-254  ·  STATUS: real
 *
 * 责任：参数 `attempt: number` 的 `恰好通过` 类（store.ts:442）
 * 维度坐标：`observeUsage` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-254.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { TaskStore, asReader } from "../../../src/store.js";
import {
  accept,
  acceptDiscussion,
  discussionTask,
  newStore,
  rawUsageSample,
  result,
  task,
} from "./support/repo-fix.js";
import type { AgentResult } from "../../../src/types.js";

describe("UT-REPO-254 · observeUsage · 数值/长度上限参数 × 恰好通过", () => {

  it("records usage for the exact attempt number", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 attempt 的恰好通过类——源码无显式上限常量，取类型定义的起始边界 1，
      // 并按 (task_id, operation_id, step_id, attempt) 主键精确命中
      store.createOrGet(task("ou-254"), "slinky", 10);
      store.reserveModel("ou-254", "op", "step", 1);

      // 步骤 2：调用 observeUsage("ou-254", "op", "step", 1, raw)
      store.observeUsage("ou-254", "op", "step", 1, rawUsageSample());

      // 步骤 3：断言逐值对账——恰好命中该尝试行，状态转 UsageObserved
      const row = store.db.prepare("SELECT state,raw_usage_json FROM model_attempts").get() as any;
      expect(row.state).toBe("UsageObserved");
      expect(JSON.parse(row.raw_usage_json)).toEqual(rawUsageSample());
    } finally {
      store.close();
    }
  });

});
