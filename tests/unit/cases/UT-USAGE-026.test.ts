/**
 * Case ID: UT-USAGE-026  ·  STATUS: real
 *
 * 责任：throw L10 `usage total mismatch`（守卫 `if (u.input_tokens !== null && u.output…`；semantic.ts）
 * 维度坐标：`validateUsage` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-026.md（脚本的唯一依据）
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

describe("UT-USAGE-026 · validateUsage · 错误路径 × 每个 typed 错误码", () => {
  it("rejects when total_tokens differs from input plus output", () => {
    // 步骤 1：守卫取真——三项皆已知但总和不自洽
    const input: TokenUsage = { ...base, input_tokens: 10, output_tokens: 5, total_tokens: 16 };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言 typed 错误 code 逐值等于 `usage total mismatch`
    expect(() => validateUsage(input)).toThrow("usage total mismatch");
  });

  it("rejects when total_tokens is smaller than input plus output", () => {
    // 步骤 1：总和偏小的另一种非法值
    const input: TokenUsage = { ...base, input_tokens: 10, output_tokens: 5, total_tokens: 14 };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言同一错误码
    expect(() => validateUsage(input)).toThrow("usage total mismatch");
  });
});
