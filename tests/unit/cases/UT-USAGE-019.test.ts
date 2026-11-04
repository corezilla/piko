/**
 * Case ID: UT-USAGE-019  ·  STATUS: real
 *
 * 责任：分支 L12 `u.output_tokens !== null && (u.reasoning_toke…`（&&；semantic.ts）
 * 维度坐标：`validateUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-019.md（脚本的唯一依据）
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

describe("UT-USAGE-019 · validateUsage · 状态分支 × 合法迁移", () => {
  it("takes the guard false side when output_tokens is unknown", () => {
    // 步骤 1：output_tokens 为 null——合取第一项为假，推理用量检查跳过
    const input: TokenUsage = {
      ...base,
      quality: "Partial",
      output_tokens: null,
      missing_fields: ["output_tokens"],
    };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言不被拒绝
    expect(() => validateUsage(input)).not.toThrow();
  });

  it("takes the guard true side when reasoning_tokens exceeds output_tokens", () => {
    // 步骤 1：output_tokens 已知、reasoning_tokens 超过它
    const input: TokenUsage = { ...base, output_tokens: 5, reasoning_tokens: 6 };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言拒绝
    expect(() => validateUsage(input)).toThrow("reasoning usage exceeds output");
  });
});
