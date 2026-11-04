/**
 * Case ID: UT-USAGE-021  ·  STATUS: real
 *
 * 责任：throw L4 `usage observed attempts exceed model attempts`（守卫 `if (u.usage_observed_attempts > u.model_attempts)`；semantic.ts）
 * 维度坐标：`validateUsage` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-021.md（脚本的唯一依据）
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

describe("UT-USAGE-021 · validateUsage · 错误路径 × 每个 typed 错误码", () => {
  it("rejects when usage_observed_attempts exceeds model_attempts", () => {
    // 步骤 1：守卫取真——观测尝试数大于模型尝试数
    const input: TokenUsage = { ...base, model_attempts: 1, usage_observed_attempts: 2 };

    // 步骤 2：调用 validateUsage，抛出错误
    // 步骤 3：断言消息可判别、无部分写入（纯函数）
    expect(() => validateUsage(input)).toThrow("usage observed attempts exceed model attempts");
  });

  it("accepts the boundary where usage_observed_attempts equals model_attempts", () => {
    // 该守卫的取假侧（边界类）：相等不拒绝
    expect(() => validateUsage({ ...base, model_attempts: 2, usage_observed_attempts: 2 })).not.toThrow();
  });
});
