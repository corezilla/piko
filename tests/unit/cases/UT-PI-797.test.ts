/**
 * Case ID: UT-PI-797  ·  STATUS: real
 *
 * 责任：分支 L233 `(first === '"' && last === '"') || (first ===…`（||；tool-exec-policy.ts）
 * 维度坐标：`stripQuotes` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-797.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { stripQuotes } from "../../../src/tool-exec-policy.js";

describe("UT-PI-797 · stripQuotes · 状态分支 × 合法迁移", () => {
  it("takes both operands of the quote-pair disjunction", () => {  // takes both operands of the quote-pair disjunction
    // 步骤 1：第一个操作数取真——首尾同为双引号
    expect(stripQuotes('"x"')).toBe("x");
    // 第一个操作数取假、第二个操作数取真——首尾同为单引号
    expect(stripQuotes("'x'")).toBe("x");
    // 两个操作数都取假——没有引号
    expect(stripQuotes("xy")).toBe("xy");
  });
});
