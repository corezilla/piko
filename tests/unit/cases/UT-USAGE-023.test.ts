/**
 * Case ID: UT-USAGE-023  ·  STATUS: real
 *
 * 责任：throw L7 `invalid Complete usage`（守卫 `if (u.quality === "Complete" && (known.…`；semantic.ts）
 * 维度坐标：`validateUsage` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-023.md（脚本的唯一依据）
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

describe("UT-USAGE-023 · validateUsage · 错误路径 × 每个 typed 错误码", () => {
  it("rejects Complete usage with an incomplete field set", () => {
    // 步骤 1：守卫取真——quality=Complete 且已知字段不足 6 个
    const input: TokenUsage = {
      ...base,
      quality: "Complete",
      cache_read_tokens: null,
      missing_fields: ["cache_read_tokens"],
    };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言 typed 错误 code 逐值等于 `invalid Complete usage`，无部分写入
    expect(() => validateUsage(input)).toThrow("invalid Complete usage");
  });

  it("rejects Complete usage whose observed attempts differ from model attempts", () => {
    // 步骤 1：quality=Complete、六字段全已知，但观测尝试数与模型尝试数不等
    const input: TokenUsage = { ...base, model_attempts: 2, usage_observed_attempts: 1 };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言同一错误码
    expect(() => validateUsage(input)).toThrow("invalid Complete usage");
  });
});
