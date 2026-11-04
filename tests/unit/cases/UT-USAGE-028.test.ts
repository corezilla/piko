/**
 * Case ID: UT-USAGE-028  ·  STATUS: real
 *
 * 责任：throw L12 `reasoning usage exceeds output`（守卫 `if (u.output_tokens !== null && (u.reas…`；semantic.ts）
 * 维度坐标：`validateUsage` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-028.md（脚本的唯一依据）
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

describe("UT-USAGE-028 · validateUsage · 错误路径 × 每个 typed 错误码", () => {
  it("rejects when reasoning_tokens exceeds output_tokens", () => {
    // 步骤 1：守卫取真——推理用量超过输出用量
    const input: TokenUsage = { ...base, output_tokens: 5, reasoning_tokens: 6 };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言 typed 错误 code 逐值等于 `reasoning usage exceeds output`
    expect(() => validateUsage(input)).toThrow("reasoning usage exceeds output");
  });
});
