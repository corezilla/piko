/**
 * Case ID: UT-USAGE-012  ·  STATUS: real
 *
 * 责任：分支 L8 `known.length === 0 || known.length === 6`（||；semantic.ts）
 * 维度坐标：`validateUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-012.md（脚本的唯一依据）
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

describe("UT-USAGE-012 · validateUsage · 状态分支 × 合法迁移", () => {
  it("rejects Partial with no known field and rejects Partial with all fields known", () => {
    // 步骤 1：两个析取项各自取真——已知 0 个 与 已知 6 个
    const none: TokenUsage = {
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
    const all: TokenUsage = { ...base, quality: "Partial" };

    // 步骤 2：分别调用 validateUsage
    // 步骤 3：断言两者都被拒绝
    expect(() => validateUsage(none)).toThrow("invalid Partial usage");
    expect(() => validateUsage(all)).toThrow("invalid Partial usage");
  });
});
