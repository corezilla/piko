/**
 * Case ID: UT-USAGE-006  ·  STATUS: real
 *
 * 责任：参数 `u: TokenUsage` 的 `非法值` 类（semantic.ts:3）
 * 维度坐标：`validateUsage` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-006.md（脚本的唯一依据）
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

describe("UT-USAGE-006 · validateUsage · 纯函数/无副作用 × 非法值", () => {
  it("rejects a record whose total does not equal input plus output", () => {
    // 步骤 1：非法值——total_tokens 与 input+output 不自洽
    const input: TokenUsage = { ...base, input_tokens: 10, output_tokens: 5, total_tokens: 999 };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言 typed 错误、无部分写入
    expect(() => validateUsage(input)).toThrow("usage total mismatch");
  });

  it("rejects a record whose known fields contradict the quality declaration", () => {
    // 步骤 1：非法值——quality=Complete 却有字段缺失（已知字段数 ≠ 6）
    const input: TokenUsage = {
      ...base,
      quality: "Complete",
      cache_read_tokens: null,
      missing_fields: ["cache_read_tokens"],
    };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言被拒绝
    expect(() => validateUsage(input)).toThrow("invalid Complete usage");
  });

  it("rejects a record whose total contradicts input plus output", () => {
    // 步骤 1：非法值——total 与 input+output 不自洽
    const input: TokenUsage = { ...base, input_tokens: 10, output_tokens: 5, total_tokens: 999 };

    // 步骤 2：调用 validateUsage
    // 步骤 3：断言被拒绝
    expect(() => validateUsage(input)).toThrow("usage total mismatch");
  });

  it("does not claim a duty the design does not declare", () => {
    // 边界说明：validateUsage 的义务范围是 VRC-USAGE-001/002（逐字段 sum/null 与三态），
    // 不含「拒绝 missing_fields 里的未知字段名」与「拒绝负计数」—— ISD §2.3 记其为
    // Current 行为（目标形态 SemanticCheck 尚未实现）。此处固定该边界，防止
    // 后续把未声明义务写成断言（那会让 Case 失败于设计的空白而非实现的缺陷）。
    const unknownField: TokenUsage = { ...base, missing_fields: ["not_a_field"] };
    const negative: TokenUsage = { ...base, model_attempts: -1, usage_observed_attempts: -1 };
    expect(() => validateUsage(unknownField)).not.toThrow();
    expect(() => validateUsage(negative)).not.toThrow();
  });
});
