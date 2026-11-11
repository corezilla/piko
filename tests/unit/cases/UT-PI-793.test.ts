/**
 * Case ID: UT-PI-793  ·  STATUS: real
 *
 * 责任：参数 `value: string` 的 `超长` 类（tool-exec-policy.ts:229）
 * 维度坐标：`stripQuotes` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-793.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { stripQuotes } from "../../../src/tool-exec-policy.js";

describe("UT-PI-793 · stripQuotes · 字符串/路径/枚举输入 × 超长", () => {
  it("keeps an over-long value verbatim", () => {  // keeps an over-long value verbatim
    // 步骤 1：超长类——长度 2×4096 的字符串
    const long = "x".repeat(8192);
    // 步骤 2：调用 stripQuotes(long)
    // 步骤 3：断言实际行为——不截断、不拒绝，原样返回
    expect(stripQuotes(long)).toBe(long);
    expect(stripQuotes(long)).toHaveLength(8192);
  });
});
