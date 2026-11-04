/**
 * Case ID: UT-USAGE-011  ·  STATUS: real
 *
 * 责任：分支 L8 `known.length === 0 || known.length === 6 || u…`（||；semantic.ts）
 * 维度坐标：`validateUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-011.md（脚本的唯一依据）
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

describe("UT-USAGE-011 · validateUsage · 状态分支 × 合法迁移", () => {
  it("takes the disjunction true side through known.length === 0", () => {
    // 步骤 1：quality=Partial 且一个字段都未知——第一个析取项为真
    const input: TokenUsage = {
      ...base,
      quality: "Partial",
      input_tokens: null,
      output_tokens: null,
      total_tokens: null,
      cache_read_tokens: null,
      cache_write_tokens: null,
      reasoning_tokens: null,
      missing_fields: [
        "input_tokens",
        "output_tokens",
        "total_tokens",
        "cache_read_tokens",
        "cache_write_tokens",
        "reasoning_tokens",
      ],
    };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言拒绝
    expect(() => validateUsage(input)).toThrow("invalid Partial usage");
  });

  it("takes the disjunction true side through the third operand (observed attempts is zero)", () => {
    // 步骤 1：quality=Partial、已知字段在 1..5 之间（第一、二项为假），但观测尝试数为 0
    const input: TokenUsage = {
      ...base,
      quality: "Partial",
      cache_read_tokens: null,
      missing_fields: ["cache_read_tokens"],
      model_attempts: 0,
      usage_observed_attempts: 0,
    };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言拒绝
    expect(() => validateUsage(input)).toThrow("invalid Partial usage");
  });
});
