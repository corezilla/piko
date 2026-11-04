/**
 * Case ID: UT-USAGE-014  ·  STATUS: real
 *
 * 责任：分支 L10 `u.input_tokens !== null && u.output_tokens !=…`（&&；semantic.ts）
 * 维度坐标：`validateUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-014.md（脚本的唯一依据）
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

describe("UT-USAGE-014 · validateUsage · 状态分支 × 合法迁移", () => {
  it("takes the guard false side when any of the three totals is unknown", () => {
    // 步骤 1：output_tokens 为 null——合取在第二项即短路为假
    const input: TokenUsage = {
      ...base,
      quality: "Partial",
      output_tokens: null,
      missing_fields: ["output_tokens"],
    };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言总和一致性检查不被触发
    expect(() => validateUsage(input)).not.toThrow();
  });

  it("takes the guard true side when all three are known and the sum disagrees", () => {
    // 步骤 1：三项皆已知但 total ≠ input+output——合取三项皆真
    const input: TokenUsage = { ...base, input_tokens: 10, output_tokens: 5, total_tokens: 999 };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言拒绝
    expect(() => validateUsage(input)).toThrow("usage total mismatch");
  });
});
