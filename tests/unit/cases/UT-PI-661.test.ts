/**
 * Case ID: UT-PI-661  ·  STATUS: real
 *
 * 责任：分支 L102 `!context.role || context.role.trim() === ""`（||；skill-tools.ts）
 * 维度坐标：`validateContext` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-661.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateContext } from "../../../src/skill-tools.js";
import type { SkillToolContext } from "../../../src/skill-tools.js";

describe("UT-PI-661 · validateContext · 状态分支 × 合法迁移", () => {
  it("short-circuits the role disjunction on both sides", async () => {  // short-circuits the role disjunction on both sides
    // 步骤 1：取真侧之一 —— 左操作数 `!context.role` 为真时短路，`.trim()` 不会被求值。
    // 若短路失效，null／0 会因为缺少 trim 抛 TypeError 而不是 "role required"。
    expect(() => validateContext({ role: null, projectName: "piko" } as unknown as SkillToolContext)).toThrowError(new Error("role required"));
    expect(() => validateContext({ role: 0, projectName: "piko" } as unknown as SkillToolContext)).toThrowError(new Error("role required"));
    // 取真侧之二 —— 左操作数为假（role 是真值），右操作数 `role.trim() === ""` 为真
    expect(() => validateContext({ role: "   ", projectName: "piko" })).toThrowError(new Error("role required"));
    // 步骤 3 / 4：取假侧 —— 两个操作数都为假，整个条件为假，跳过该块
    expect(() => validateContext({ role: "tester", projectName: "" })).toThrowError(new Error("projectName required"));
    expect(validateContext({ role: "tester", projectName: "piko" })).toBeUndefined();
  });
});
