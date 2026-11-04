/**
 * Case ID: UT-USAGE-013  ·  STATUS: real
 *
 * 责任：分支 L9 `u.quality === "Unknown" && known.length !== 0`（&&；semantic.ts）
 * 维度坐标：`validateUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-013.md（脚本的唯一依据）
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

describe("UT-USAGE-013 · validateUsage · 状态分支 × 合法迁移", () => {
  it("takes the guard false side when quality is Unknown with no known field", () => {
    // 步骤 1：quality=Unknown 且一个字段都未知——右项为假
    const input: TokenUsage = {
      ...base,
      quality: "Unknown",
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
    // 步骤 3：断言该合取守卫不拒绝
    expect(() => validateUsage(input)).not.toThrow();
  });

  it("takes the guard true side when quality is Unknown but a field is known", () => {
    // 步骤 1：quality=Unknown 但仍有已知字段——右项为真
    const input: TokenUsage = {
      ...base,
      quality: "Unknown",
      cache_read_tokens: null,
      missing_fields: ["cache_read_tokens"],
    };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言拒绝
    expect(() => validateUsage(input)).toThrow("invalid Unknown usage");
  });
});
