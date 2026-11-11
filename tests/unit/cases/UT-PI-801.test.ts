/**
 * Case ID: UT-PI-801  ·  STATUS: real
 *
 * 责任：返回站点 L237 值 `value` 逐值断言（tool-exec-policy.ts）
 * 维度坐标：`stripQuotes` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-801.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { stripQuotes } from "../../../src/tool-exec-policy.js";

describe("UT-PI-801 · stripQuotes · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the value itself on the fallback site", () => {  // returns the value itself on the fallback site
    // 步骤 1：到达 L237（value）返回站点的输入
    // 步骤 2：调用 stripQuotes
    // 步骤 3：断言返回值逐值对账
    expect(stripQuotes("abc")).toBe("abc");
    expect(stripQuotes('"abc')).toBe('"abc');
    expect(stripQuotes('abc"')).toBe('abc"');
    expect(stripQuotes('"abc"')).not.toBe('"abc"');
  });
});
