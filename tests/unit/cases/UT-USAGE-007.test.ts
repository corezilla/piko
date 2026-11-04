/**
 * Case ID: UT-USAGE-007  ·  STATUS: real
 *
 * 责任：分支 L6 `loop (fields)`（loop；semantic.ts）
 * 维度坐标：`validateUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-007.md（脚本的唯一依据）
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

describe("UT-USAGE-007 · validateUsage · 状态分支 × 合法迁移", () => {
  it("evaluates the missing_fields check for every token field", () => {
    // 步骤 1：守卫取真——让循环在第一个字段（input_tokens）上就命中不匹配
    const input: TokenUsage = { ...base, input_tokens: null, total_tokens: null };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言循环在第一个字段上拒绝，消息指到该字段
    expect(() => validateUsage(input)).toThrow("usage missing mismatch: input_tokens");
  });

  it("reaches the later fields of the loop when the earlier ones are consistent", () => {
    // 步骤 1：前两个字段自洽，第三个（total_tokens）不匹配——证明循环继续往下走
    const input: TokenUsage = {
      ...base,
      output_tokens: null,
      total_tokens: null,
      missing_fields: ["output_tokens"],
    };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言拒绝的消息指向循环里较后的字段
    expect(() => validateUsage(input)).toThrow("usage missing mismatch: total_tokens");
  });

  it("passes the whole loop when every field matches its missing_fields entry", () => {
    // 取假侧：六个字段逐一自洽，循环走完不拒绝
    const input: TokenUsage = {
      ...base,
      quality: "Partial",
      cache_read_tokens: null,
      missing_fields: ["cache_read_tokens"],
    };
    expect(() => validateUsage(input)).not.toThrow();
  });
});
