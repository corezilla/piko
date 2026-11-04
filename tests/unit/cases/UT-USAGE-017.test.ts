/**
 * Case ID: UT-USAGE-017  ·  STATUS: real
 *
 * 责任：分支 L11 `u.cache_read_tokens ?? 0`（??；semantic.ts）
 * 维度坐标：`validateUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-017.md（脚本的唯一依据）
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

describe("UT-USAGE-017 · validateUsage · 状态分支 × 合法迁移", () => {
  it("treats a null cache_read_tokens as zero (no rejection)", () => {
    // 步骤 1：cache_read_tokens 为 null——?? 取右侧 0
    const input: TokenUsage = {
      ...base,
      quality: "Partial",
      cache_read_tokens: null,
      missing_fields: ["cache_read_tokens"],
    };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言 null 被当作 0，不构成「缓存超过输入」
    expect(() => validateUsage(input)).not.toThrow();
  });

  it("treats a non-null cache_read_tokens as itself", () => {
    // 步骤 1：cache_read_tokens 有值——?? 取左侧
    const input: TokenUsage = { ...base, input_tokens: 10, cache_read_tokens: 11 };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言按真实值比较（11 > 10）而拒绝
    expect(() => validateUsage(input)).toThrow("cache usage exceeds input");
  });
});
