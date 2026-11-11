/**
 * Case ID: UT-PI-658  ·  STATUS: real
 *
 * 责任：参数 `context: SkillToolContext` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:101）
 * 维度坐标：`validateContext` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-658.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateContext } from "../../../src/skill-tools.js";
import type { SkillToolContext } from "../../../src/skill-tools.js";

describe("UT-PI-658 · validateContext · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("rejects the empty and blank boundary values and accepts the single-character ones", async () => {  // rejects the empty and blank boundary values and accepts the single-character ones
    // 步骤 1：按 `边界(上/下/零/空/满)` 类构造 context —— 下界（空串／空白串）、
    // 单字符下界、以及没有长度上界时的长值。
    // 步骤 2 / 3：调用 validateContext 并逐值对账返回值或错误消息
    // 下界：role 为空串／空白串
    expect(() => validateContext({ role: "", projectName: "piko" })).toThrowError(new Error("role required"));
    expect(() => validateContext({ role: "   ", projectName: "piko" })).toThrowError(new Error("role required"));
    // 下界：projectName 为空串／空白串
    expect(() => validateContext({ role: "tester", projectName: "" })).toThrowError(new Error("projectName required"));
    expect(() => validateContext({ role: "tester", projectName: " \t " })).toThrowError(new Error("projectName required"));
    // 单字符下界：两个字段各一个字符，被接受
    expect(validateContext({ role: "a", projectName: "a" })).toBeUndefined();
    // 上界：role / projectName 都没有长度上限，长值照样被接受
    expect(validateContext({ role: "r".repeat(256), projectName: "p".repeat(256) })).toBeUndefined();
  });
});
