/**
 * Case ID: UT-PI-006  ·  STATUS: real
 *
 * 责任：`normalizeRawUsage` × `纯函数/无副作用` × `每等价类合法值`（波次一粗粒度登记；pi-runtime.ts:44）
 * 维度坐标：`normalizeRawUsage` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-006.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { normalizeRawUsage } from "../../../src/pi-runtime.js";

describe("UT-PI-006 · normalizeRawUsage · 纯函数/无副作用 × 每等价类合法值", () => {
  it("normalizes each usage field to a number or undefined and never fabricates a zero", async () => {  // normalizes each usage field to a number or undefined and never fabricates a zero
    // 步骤 1：完整用法 —— 每个字段都是数字
    expect(
      normalizeRawUsage({
        input_tokens: 11,
        output_tokens: 22,
        total_tokens: 33,
        input_tokens_details: { cached_tokens: 4, cache_write_tokens: 5 },
        output_tokens_details: { reasoning_tokens: 6 },
      }),
    ).toEqual({
      input: 11,
      output: 22,
      totalTokens: 33,
      cacheRead: 4,
      cacheWrite: 5,
      reasoning: 6,
    });

    // 步骤 2：缺失字段 —— 一律 undefined，绝不用 0 冒充「未报告」
    expect(normalizeRawUsage({})).toEqual({
      input: undefined,
      output: undefined,
      totalTokens: undefined,
      cacheRead: undefined,
      cacheWrite: undefined,
      reasoning: undefined,
    });

    // 步骤 3：非数字值 —— 同样退化为 undefined，不做类型强转
    expect(
      normalizeRawUsage({
        input_tokens: "11",
        output_tokens: null,
        total_tokens: 3.5,
        input_tokens_details: { cached_tokens: "4" },
        output_tokens_details: { reasoning_tokens: true },
      }),
    ).toEqual({
      input: undefined,
      output: undefined,
      // 3.5 仍是 number —— 实现只做 typeof 判定，不做整数化，故原样透传
      totalTokens: 3.5,
      cacheRead: undefined,
      cacheWrite: undefined,
      reasoning: undefined,
    });

    // 步骤 4：非对象输入 —— 不抛错，退化为全 undefined
    expect(normalizeRawUsage(undefined)).toEqual({
      input: undefined,
      output: undefined,
      totalTokens: undefined,
      cacheRead: undefined,
      cacheWrite: undefined,
      reasoning: undefined,
    });
    expect(normalizeRawUsage(null)).toEqual({
      input: undefined,
      output: undefined,
      totalTokens: undefined,
      cacheRead: undefined,
      cacheWrite: undefined,
      reasoning: undefined,
    });
  });
});
