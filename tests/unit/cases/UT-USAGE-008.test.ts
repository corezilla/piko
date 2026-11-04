/**
 * Case ID: UT-USAGE-008  ·  STATUS: real
 *
 * 责任：分支 L7 `u.quality === "Complete" && (known.length !==…`（&&；semantic.ts）
 * 维度坐标：`validateUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-008.md（脚本的唯一依据）
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

describe("UT-USAGE-008 · validateUsage · 状态分支 × 合法迁移", () => {
  it("takes the guard false side when quality is Complete and all six fields are known", () => {
    // 步骤 1：quality=Complete 且六字段全已知——左项为真、右项为假
    const input: TokenUsage = { ...base };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言该合取守卫不拒绝
    expect(() => validateUsage(input)).not.toThrow();
  });

  it("takes the guard true side when quality is Complete but a field is missing", () => {
    // 步骤 1：左项为真（quality=Complete），右项为真（known.length !== 6）
    const input: TokenUsage = {
      ...base,
      quality: "Complete",
      cache_read_tokens: null,
      missing_fields: ["cache_read_tokens"],
    };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言拒绝
    expect(() => validateUsage(input)).toThrow("invalid Complete usage");
  });
});
