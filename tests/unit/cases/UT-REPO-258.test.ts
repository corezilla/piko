/**
 * Case ID: UT-REPO-258  ·  STATUS: real
 *
 * 责任：参数 `raw: unknown` 的 `边界(上/下/零/空/满)` 类（store.ts:442）
 * 维度坐标：`observeUsage` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-258.md（脚本的唯一依据）
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

describe("UT-REPO-258 · observeUsage · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {

  it("stores the zero-valued boundary usage sample verbatim", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 raw 的边界等价类——全零用量的样本
      store.createOrGet(task("ou-258"), "slinky", 10);
      store.reserveModel("ou-258", "op", "step", 1);
      const zero = rawUsageSample({ input: 0, output: 0, totalTokens: 0, cacheRead: 0, cacheWrite: 0 });

      // 步骤 2：调用 observeUsage("ou-258", "op", "step", 1, zero)
      store.observeUsage("ou-258", "op", "step", 1, zero);

      // 步骤 3：断言逐值对账——零值合法，原样落库且被 usageSoFar 累加成 0
      const row = store.db.prepare("SELECT raw_usage_json FROM model_attempts").get() as any;
      expect(JSON.parse(row.raw_usage_json)).toEqual(zero);
      expect(store.getRun("ou-258").progress.usage_so_far).toEqual({
        input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0,
      });
    } finally {
      store.close();
    }
  });

});
