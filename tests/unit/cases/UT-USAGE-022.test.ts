/**
 * Case ID: UT-USAGE-022  ·  STATUS: real
 *
 * 责任：throw L6 `reject`（守卫 `if ((u[f] === null) !== missing.has(f))`；semantic.ts）
 * 维度坐标：`validateUsage` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-022.md（脚本的唯一依据）
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

describe("UT-USAGE-022 · validateUsage · 错误路径 × 每个 typed 错误码", () => {
  it("rejects when a field is null but not listed in missing_fields", () => {
    // 步骤 1：守卫取真——input_tokens 为 null，但 missing_fields 为空
    const input: TokenUsage = { ...base, input_tokens: null, total_tokens: null };

    // 步骤 2：调用 validateUsage，抛出错误
    // 步骤 3：断言消息可判别且逐值指到出错字段名
    expect(() => validateUsage(input)).toThrow("usage missing mismatch: input_tokens");
  });

  it("rejects when a field is present but listed in missing_fields", () => {
    // 同一守卫的另一种触发：字段有值却被登记为缺失
    const input: TokenUsage = { ...base, missing_fields: ["input_tokens"] };
    expect(() => validateUsage(input)).toThrow("usage missing mismatch: input_tokens");
  });

  it("names each mismatching field (the message is per-field)", () => {
    // 该守卫在 for 循环内逐字段求值：消息必须指出具体字段
    const input: TokenUsage = {
      ...base,
      output_tokens: null,
      total_tokens: null,
      missing_fields: ["output_tokens"],
    };
    expect(() => validateUsage(input)).toThrow("usage missing mismatch: total_tokens");
  });

  it("accepts a consistent null/missing_fields pair (guard false side)", () => {
    // 取假侧：一个字段为 null 且确实登记在 missing_fields 里——两者一致即不拒绝。
    // quality 必须自洽（Partial：已知字段数在 1..5 之间），否则会先命中
    // 「invalid Partial usage」那条守卫，测的就不是本守卫了。
    const input: TokenUsage = {
      ...base,
      quality: "Partial",
      cache_read_tokens: null,
      missing_fields: ["cache_read_tokens"],
    };
    expect(() => validateUsage(input)).not.toThrow();
  });
});
