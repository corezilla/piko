/**
 * Case ID: UT-REPO-259  ·  STATUS: real
 *
 * 责任：参数 `raw: unknown` 的 `非法值` 类（store.ts:442）
 * 维度坐标：`observeUsage` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-259.md（脚本的唯一依据）
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

describe("UT-REPO-259 · observeUsage · 纯函数/无副作用 × 非法值", () => {

  it("stores an out-of-schema raw usage object verbatim (no runtime validation)", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造 raw 的非法值类——缺少 cacheRead/cacheWrite、多了未知字段 bogus
      store.createOrGet(task("ou-259"), "slinky", 10);
      store.reserveModel("ou-259", "op", "step", 1);
      const bad = { input: 1, output: 2, totalTokens: 3, bogus: "not-in-schema" };

      // 步骤 2：调用 observeUsage("ou-259", "op", "step", 1, bad)
      store.observeUsage("ou-259", "op", "step", 1, bad);

      // 步骤 3：断言逐值对账。
      // 实现对 raw 无任何运行时校验（不做 validateUsage），非法对象被原样序列化落库，
      // 且不抛 typed 错误——故断言真实的"接受并落库"事实，而非"被拒绝"。
      const row = store.db.prepare("SELECT raw_usage_json FROM model_attempts").get() as any;
      expect(JSON.parse(row.raw_usage_json)).toEqual(bad);
      expect(store.getRun("ou-259").progress.usage_so_far).toEqual({
        input_tokens: 1,
        output_tokens: 2,
        total_tokens: 3,
      });
    } finally {
      store.close();
    }
  });

});
