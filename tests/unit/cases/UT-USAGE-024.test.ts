/**
 * Case ID: UT-USAGE-024  ·  STATUS: real
 *
 * 责任：throw L8 `invalid Partial usage`（守卫 `if (u.quality === "Partial" && (known.l…`；semantic.ts）
 * 维度坐标：`validateUsage` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-024.md（脚本的唯一依据）
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

describe("UT-USAGE-024 · validateUsage · 错误路径 × 每个 typed 错误码", () => {
  it("rejects Partial usage with no known field", () => {
    // 步骤 1：守卫取真——quality=Partial 且一个字段都未知
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
    // 步骤 3：断言 typed 错误 code 逐值等于 `invalid Partial usage`
    expect(() => validateUsage(input)).toThrow("invalid Partial usage");
  });

  it("rejects Partial usage with every field known", () => {
    // 步骤 1：quality=Partial 但六字段全已知（known.length === 6）
    const input: TokenUsage = { ...base, quality: "Partial" };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言同一错误码
    expect(() => validateUsage(input)).toThrow("invalid Partial usage");
  });
});
