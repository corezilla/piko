/**
 * Case ID: UT-USAGE-004  ·  STATUS: real
 *
 * 责任：参数 `u: TokenUsage` 的 `每等价类合法值` 类（semantic.ts:3）
 * 维度坐标：`validateUsage` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-004.md（脚本的唯一依据）
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

describe("UT-USAGE-004 · validateUsage · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts a complete usage record (every equivalence class of TokenUsage)", () => {
    // 步骤 1：构造每个等价类一个代表值的合法 TokenUsage（Complete、六字段全已知、sum 自洽）
    const input: TokenUsage = { ...base };

    // 步骤 2：调用 validateUsage（semantic.ts:3）
    // 步骤 3：断言无错误、无副作用（纯函数）
    expect(() => validateUsage(input)).not.toThrow();
  });

  it("accepts the Partial and Unknown quality classes with self-consistent fields", () => {
    // 步骤 1：Partial（已知字段 1..5）与 Unknown（已知 0）两个等价类
    const partial: TokenUsage = {
      ...base,
      quality: "Partial",
      cache_read_tokens: null,
      missing_fields: ["cache_read_tokens"],
    };
    const unknown: TokenUsage = {
      ...base,
      quality: "Unknown",
      input_tokens: null,
      output_tokens: null,
      total_tokens: null,
      cache_read_tokens: null,
      cache_write_tokens: null,
      reasoning_tokens: null,
      missing_fields: [
        "input_tokens",
        "output_tokens",
        "total_tokens",
        "cache_read_tokens",
        "cache_write_tokens",
        "reasoning_tokens",
      ],
    };

    // 步骤 2：分别调用 validateUsage
    // 步骤 3：断言两个等价类都不被拒绝
    expect(() => validateUsage(partial)).not.toThrow();
    expect(() => validateUsage(unknown)).not.toThrow();
  });
});
