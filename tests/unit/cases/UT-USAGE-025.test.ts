/**
 * Case ID: UT-USAGE-025  ·  STATUS: real
 *
 * 责任：throw L9 `invalid Unknown usage`（守卫 `if (u.quality === "Unknown" && known.le…`；semantic.ts）
 * 维度坐标：`validateUsage` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-025.md（脚本的唯一依据）
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

describe("UT-USAGE-025 · validateUsage · 错误路径 × 每个 typed 错误码", () => {
  it("rejects Unknown quality while a field is known", () => {
    // 步骤 1：守卫取真——quality=Unknown 但仍有已知字段
    const input: TokenUsage = {
      ...base,
      quality: "Unknown",
      cache_read_tokens: null,
      missing_fields: ["cache_read_tokens"],
    };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言 typed 错误 code 逐值等于 `invalid Unknown usage`
    expect(() => validateUsage(input)).toThrow("invalid Unknown usage");
  });
});
