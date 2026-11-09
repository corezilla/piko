/**
 * Case ID: UT-REPO-554  ·  STATUS: real
 *
 * 责任：分支 L684 `v.input ?? 0`（??；store.ts）
 * 维度坐标：`usageSoFar` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-554.md（脚本的唯一依据）
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

describe("UT-REPO-554 · usageSoFar · 状态分支 × 合法迁移", () => {

  it("falls back to zero for a missing input field and reads it when present", async () => {
    const store = newStore();
    try {
      accept(store, task("t-554"));
      store.reserveModel("t-554", "op-554", "step-with-input", 1);
      store.observeUsage("t-554", "op-554", "step-with-input", 1, { input: 12, output: 3, totalTokens: 15 });
      store.reserveModel("t-554", "op-554", "step-without-input", 1);
      store.observeUsage("t-554", "op-554", "step-without-input", 1, { output: 4, totalTokens: 4 });

      // 步骤 1：构造使 store.ts:684 的分支（??：`v.input ?? 0`）取真的输入——记录里没有 input
      // 步骤 2：调用 usageSoFar(…) 并断言该侧可观测结果
      const usage = store.getRun("t-554").progress.usage_so_far;

      // 步骤 3：构造使该分支取假的输入——记录里有 input
      // 步骤 4：再次调用 usageSoFar(…) 并断言取假侧结果（两侧都被观测到）
      // 断言：缺失的 input 按 ?? 0 计入，12 + 0 = 12；output 3 + 4 = 7；totalTokens 15 + 4 = 19
      expect(usage).toEqual({ input_tokens: 12, output_tokens: 7, total_tokens: 19 });
    } finally {
      store.close();
    }
  });

});
