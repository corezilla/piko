/**
 * Case ID: UT-USAGE-015  ·  STATUS: real
 *
 * 责任：分支 L11 `u.input_tokens !== null && ((u.cache_read_tok…`（&&；semantic.ts）
 * 维度坐标：`validateUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-015.md（脚本的唯一依据）
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

describe("UT-USAGE-015 · validateUsage · 状态分支 × 合法迁移", () => {
  it("takes the guard false side when input_tokens is unknown", () => {
    // 步骤 1：input_tokens 为 null——合取第一项为假，缓存检查整体跳过
    const input: TokenUsage = {
      ...base,
      quality: "Partial",
      input_tokens: null,
      missing_fields: ["input_tokens"],
    };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言缓存用量检查不被触发
    expect(() => validateUsage(input)).not.toThrow();
  });

  it("takes the guard true side when cache usage exceeds input_tokens", () => {
    // 步骤 1：input_tokens 已知、缓存读数超过它
    const input: TokenUsage = { ...base, input_tokens: 10, cache_read_tokens: 11 };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言拒绝
    expect(() => validateUsage(input)).toThrow("cache usage exceeds input");
  });
});
