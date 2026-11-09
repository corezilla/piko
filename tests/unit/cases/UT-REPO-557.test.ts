/**
 * Case ID: UT-REPO-557  ·  STATUS: real
 *
 * 责任：分支 L687 `v.cacheRead ?? 0`（??；store.ts）
 * 维度坐标：`usageSoFar` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-557.md（脚本的唯一依据）
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

describe("UT-REPO-557 · usageSoFar · 状态分支 × 合法迁移", () => {
  it("adds cacheRead/cacheWrite into the input total when present and treats them as zero when absent", async () => {
    const store = newStore();
    try {
      accept(store, task("t-557"));

      // 步骤 1：构造使 store.ts:687 的分支（??：`v.cacheRead ?? 0`）取真的输入——
      //         观测值里带 cacheRead/cacheWrite
      store.reserveModel("t-557", "op-1", "s-1", 1);
      store.observeUsage("t-557", "op-1", "s-1", 1, rawUsageSample({ input: 10, output: 5, totalTokens: 15, cacheRead: 2, cacheWrite: 3 }));

      // 步骤 2：调用 usageSoFar(…) 并断言该侧可观测结果
      //         usageSoFar 是私有的，实现对外只经 getRun().progress.usage_so_far 暴露
      const withCache = (store.getRun("t-557") as any).progress.usage_so_far;
      expect(withCache).toEqual({ input_tokens: 15, output_tokens: 5, total_tokens: 15 });

      // 步骤 3：构造使该分支取假的输入——观测值里没有 cacheRead/cacheWrite 字段
      store.db.prepare("UPDATE model_attempts SET raw_usage_json=? WHERE task_id='t-557'").run(
        JSON.stringify({ input: 10, output: 5, totalTokens: 15 }),
      );

      // 步骤 4：再次调用 usageSoFar(…) 并断言取假侧结果；两侧都必须被观测到
      const withoutCache = (store.getRun("t-557") as any).progress.usage_so_far;
      expect(withoutCache).toEqual({ input_tokens: 10, output_tokens: 5, total_tokens: 15 });
      // 取真侧证明 cacheRead/cacheWrite 确实进了 input 合计（10 + 2 + 3 = 15）
      expect(withCache.input_tokens).toBe(15);
      // 取假侧证明缺失字段按 0 计入，不是 NaN/undefined
      expect(withoutCache.input_tokens).toBe(10);
    } finally {
      store.close();
    }
  });

});
