/**
 * Case ID: UT-PI-798  ·  STATUS: real
 *
 * 责任：分支 L233 `first === '"' && last === '"'`（&&；tool-exec-policy.ts）
 * 维度坐标：`stripQuotes` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-798.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { stripQuotes } from "../../../src/tool-exec-policy.js";

describe("UT-PI-798 · stripQuotes · 状态分支 × 合法迁移", () => {
  it("takes both sides of the double-quote conjunction", () => {  // takes both sides of the double-quote conjunction
    // 步骤 1：取真侧——first === 双引号 且 last === 双引号
    expect(stripQuotes('"x"')).toBe("x");
    // 步骤 3/4：取假侧——first 是双引号但 last 不是
    expect(stripQuotes('"x')).toBe('"x');
  });
});
