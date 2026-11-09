/**
 * Case ID: UT-REPO-558  ·  STATUS: real
 *
 * 责任：分支 L688 `v.cacheWrite ?? 0`（??；store.ts）
 * 维度坐标：`usageSoFar` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-558.md（脚本的唯一依据）
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

describe("UT-REPO-558 · usageSoFar · 状态分支 × 合法迁移", () => {

  it("falls back to zero for a missing cacheWrite and adds it into the input total", async () => {
    const store = newStore();
    try {
      accept(store, task("t-558"));
      store.reserveModel("t-558", "op-558", "step-with-cache", 1);
      store.observeUsage("t-558", "op-558", "step-with-cache", 1, {
        input: 10,
        output: 5,
        totalTokens: 15,
        cacheRead: 2,
        cacheWrite: 3,
      });
      store.reserveModel("t-558", "op-558", "step-without-cache", 1);
      store.observeUsage("t-558", "op-558", "step-without-cache", 1, { input: 4, output: 1, totalTokens: 5 });

      // 步骤 1：构造使 store.ts:688 的分支（??：`v.cacheWrite ?? 0`）取真的输入——记录里没有 cacheWrite
      // 步骤 2：调用 usageSoFar(…) 并断言该侧可观测结果
      const usage = store.getRun("t-558").progress.usage_so_far;

      // 步骤 3：构造使该分支取假的输入——记录里有 cacheWrite
      // 步骤 4：再次调用 usageSoFar(…) 并断言取假侧结果（两侧都被观测到）
      // 断言：input_tokens = (10 + cacheRead 2 + cacheWrite 3) + (4 + 0 + 0) = 19
      expect(usage).toEqual({ input_tokens: 19, output_tokens: 6, total_tokens: 20 });
    } finally {
      store.close();
    }
  });

});
