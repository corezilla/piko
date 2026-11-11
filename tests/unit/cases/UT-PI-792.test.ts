/**
 * Case ID: UT-PI-792  ·  STATUS: real
 *
 * 责任：参数 `value: string` 的 `空` 类（tool-exec-policy.ts:229）
 * 维度坐标：`stripQuotes` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-792.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { stripQuotes } from "../../../src/tool-exec-policy.js";

describe("UT-PI-792 · stripQuotes · 字符串/路径/枚举输入 × 空", () => {
  it("handles the empty class of the value parameter", () => {  // handles the empty class of the value parameter
    // 步骤 1：空类三态——空串 / undefined（缺省）/ null（显式空值）
    // 步骤 2：调用 stripQuotes
    // 步骤 3：断言实际行为——空串原样返回；undefined 与 null 在读 .length 时抛 TypeError
    expect(stripQuotes("")).toBe("");
    expect(() => stripQuotes(undefined as unknown as string)).toThrow(TypeError);
    expect(() => stripQuotes(null as unknown as string)).toThrow(TypeError);
  });
});
