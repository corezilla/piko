/**
 * Case ID: UT-PI-795  ·  STATUS: real
 *
 * 责任：分支 L230 `if (value.length >= 2)`（if；tool-exec-policy.ts）
 * 维度坐标：`stripQuotes` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-795.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { stripQuotes } from "../../../src/tool-exec-policy.js";

describe("UT-PI-795 · stripQuotes · 状态分支 × 合法迁移", () => {
  it("takes both sides of the length guard", () => {  // takes both sides of the length guard
    // 步骤 1：取真侧——长度 ≥ 2 且首尾同为引号
    expect(stripQuotes('"a"')).toBe("a");
    // 步骤 3/4：取假侧——长度 < 2，跳过整块，原样返回
    expect(stripQuotes("a")).toBe("a");
    expect(stripQuotes("")).toBe("");
    // 取假侧的返回值与入参是同一个字符串（未做任何切片）
    const one = "a";
    expect(stripQuotes(one)).toBe(one);
  });
});
