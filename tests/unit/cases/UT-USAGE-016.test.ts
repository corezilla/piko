/**
 * Case ID: UT-USAGE-016  ·  STATUS: real
 *
 * 责任：分支 L11 `(u.cache_read_tokens ?? 0)>u.input_tokens || …`（||；semantic.ts）
 * 维度坐标：`validateUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-016.md（脚本的唯一依据）
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

describe("UT-USAGE-016 · validateUsage · 状态分支 × 合法迁移", () => {
  it("takes the disjunction true side through the cache read operand", () => {
    // 步骤 1：缓存读数超过 input_tokens——第一个析取项为真
    const input: TokenUsage = { ...base, input_tokens: 10, cache_read_tokens: 11 };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言拒绝
    expect(() => validateUsage(input)).toThrow("cache usage exceeds input");
  });

  it("takes the disjunction true side through the cache write operand", () => {
    // 步骤 1：缓存读数正常（第一项为假），缓存写数超过 input_tokens——第二项为真
    const input: TokenUsage = { ...base, input_tokens: 10, cache_read_tokens: 0, cache_write_tokens: 11 };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言拒绝
    expect(() => validateUsage(input)).toThrow("cache usage exceeds input");
  });
});
