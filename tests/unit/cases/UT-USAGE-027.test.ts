/**
 * Case ID: UT-USAGE-027  ·  STATUS: real
 *
 * 责任：throw L11 `cache usage exceeds input`（守卫 `if (u.input_tokens !== null && ((u.cach…`；semantic.ts）
 * 维度坐标：`validateUsage` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-027.md（脚本的唯一依据）
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

describe("UT-USAGE-027 · validateUsage · 错误路径 × 每个 typed 错误码", () => {
  it("rejects when cache_read_tokens exceeds input_tokens", () => {
    // 步骤 1：守卫取真——缓存读数超过输入
    const input: TokenUsage = { ...base, input_tokens: 10, cache_read_tokens: 11 };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言 typed 错误 code 逐值等于 `cache usage exceeds input`
    expect(() => validateUsage(input)).toThrow("cache usage exceeds input");
  });

  it("rejects when cache_write_tokens exceeds input_tokens", () => {
    // 步骤 1：守卫取真的另一分支——缓存写数超过输入
    const input: TokenUsage = { ...base, input_tokens: 10, cache_write_tokens: 11 };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言同一错误码
    expect(() => validateUsage(input)).toThrow("cache usage exceeds input");
  });
});
