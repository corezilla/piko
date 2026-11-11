/**
 * Case ID: UT-PI-794  ·  STATUS: real
 *
 * 责任：参数 `value: string` 的 `注入字符` 类（tool-exec-policy.ts:229）
 * 维度坐标：`stripQuotes` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-794.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { stripQuotes } from "../../../src/tool-exec-policy.js";

describe("UT-PI-794 · stripQuotes · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected value as data", () => {  // treats an injected value as data
    // 步骤 1：注入类——路径穿越 / 命令元字符 / SQL 元字符
    const traversal = '"../../etc/passwd"';
    const command = "'; rm -rf /; '";
    const sql = '"x\'; DROP TABLE tasks; --"';
    // 步骤 2：调用 stripQuotes
    // 步骤 3：断言实际行为——只剥最外层同种引号，不解释内容
    expect(stripQuotes(traversal)).toBe("../../etc/passwd");
    expect(stripQuotes(command)).toBe("; rm -rf /; ");
    expect(stripQuotes(sql)).toBe("x\'; DROP TABLE tasks; --");
  });
});
