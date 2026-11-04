/**
 * Case ID: UT-USAGE-005  ·  STATUS: real
 *
 * 责任：参数 `u: TokenUsage` 的 `边界(上/下/零/空/满)` 类（semantic.ts:3）
 * 维度坐标：`validateUsage` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-005.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateUsage } from "../../../src/semantic.js";
import type { TokenUsage } from "../../../src/types.js";

const base: TokenUsage = {
  source: "PiModelResponses",
  quality: "Complete",
  input_tokens: 10,
  output_tokens: 5,
  total_tokens: 15,
  cache_read_tokens: 0,
  cache_write_tokens: 0,
  reasoning_tokens: 0,
  model_attempts: 2,
  usage_observed_attempts: 2,
  missing_fields: [],
};

describe("UT-USAGE-005 · validateUsage · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("accepts the zero boundary (all counters and tokens at zero)", () => {
    // 步骤 1：全部数值字段取下界 0
    const input: TokenUsage = {
      ...base,
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      cache_read_tokens: 0,
      cache_write_tokens: 0,
      reasoning_tokens: 0,
      model_attempts: 0,
      usage_observed_attempts: 0,
    };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言零边界被接受
    expect(() => validateUsage(input)).not.toThrow();
  });

  it("accepts the equal boundary (cache usage exactly equals input_tokens)", () => {
    // 步骤 1：cache_read_tokens 与 cache_write_tokens 各自恰好等于 input_tokens（上界）
    const input: TokenUsage = {
      ...base,
      input_tokens: 10,
      output_tokens: 5,
      total_tokens: 15,
      cache_read_tokens: 10,
      cache_write_tokens: 10,
    };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言恰好等于上界不被拒绝（严格大于才拒绝）
    expect(() => validateUsage(input)).not.toThrow();
  });

  it("accepts the reasoning upper boundary (reasoning_tokens exactly equals output_tokens)", () => {
    const input: TokenUsage = { ...base, output_tokens: 5, reasoning_tokens: 5 };
    expect(() => validateUsage(input)).not.toThrow();
  });
});
