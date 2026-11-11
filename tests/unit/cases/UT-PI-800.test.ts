/**
 * Case ID: UT-PI-800  ·  STATUS: real
 *
 * 责任：返回站点 L234 值 `value.slice(1, -1)` 逐值断言（tool-exec-policy.ts）
 * 维度坐标：`stripQuotes` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-800.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { stripQuotes } from "../../../src/tool-exec-policy.js";

describe("UT-PI-800 · stripQuotes · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the exact slice of the quoted value", () => {  // returns the exact slice of the quoted value
    // 步骤 1：到达 L234（value.slice(1, -1)）的等价类
    // 步骤 2：调用 stripQuotes
    // 步骤 3：断言返回值逐值对账
    expect(stripQuotes('"abc"')).toBe("abc");
    expect(stripQuotes("'abc'")).toBe("abc");
    // 只切掉最外层各一个字符
    expect(stripQuotes('""')).toBe("");
    expect(stripQuotes('"a"b"')).toBe('a"b');
  });
});
