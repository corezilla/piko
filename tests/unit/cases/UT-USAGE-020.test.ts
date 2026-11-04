/**
 * Case ID: UT-USAGE-020  ·  STATUS: real
 *
 * 责任：分支 L12 `u.reasoning_tokens ?? 0`（??；semantic.ts）
 * 维度坐标：`validateUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-020.md（脚本的唯一依据）
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

describe("UT-USAGE-020 · validateUsage · 状态分支 × 合法迁移", () => {
  it("treats a null reasoning_tokens as zero (no rejection)", () => {
    // 步骤 1：reasoning_tokens 为 null——?? 取右侧 0
    const input: TokenUsage = {
      ...base,
      quality: "Partial",
      reasoning_tokens: null,
      missing_fields: ["reasoning_tokens"],
    };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言 null 被当作 0
    expect(() => validateUsage(input)).not.toThrow();
  });

  it("treats a non-null reasoning_tokens as itself", () => {
    // 步骤 1：reasoning_tokens 有值且超过 output_tokens
    const input: TokenUsage = { ...base, output_tokens: 5, reasoning_tokens: 6 };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言按真实值比较而拒绝
    expect(() => validateUsage(input)).toThrow("reasoning usage exceeds output");
  });
});
