/**
 * Case ID: UT-PI-664  ·  STATUS: real
 *
 * 责任：分支 L105 `!context.projectName || context.projectName.t…`（||；skill-tools.ts）
 * 维度坐标：`validateContext` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-664.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateContext } from "../../../src/skill-tools.js";
import type { SkillToolContext } from "../../../src/skill-tools.js";

describe("UT-PI-664 · validateContext · 状态分支 × 合法迁移", () => {
  it("short-circuits the project name disjunction on both sides", async () => {  // short-circuits the project name disjunction on both sides
    // 步骤 1：取真侧之一 —— 左操作数 `!context.projectName` 为真时短路，`.trim()` 不被求值。
    // 若短路失效，null／0 会因为缺少 trim 抛 TypeError 而不是 "projectName required"。
    expect(() => validateContext({ role: "tester", projectName: null } as unknown as SkillToolContext)).toThrowError(new Error("projectName required"));
    expect(() => validateContext({ role: "tester", projectName: 0 } as unknown as SkillToolContext)).toThrowError(new Error("projectName required"));
    // 取真侧之二 —— 左操作数为假（projectName 是真值），右操作数 `trim() === ""` 为真
    expect(() => validateContext({ role: "tester", projectName: "   " })).toThrowError(new Error("projectName required"));
    // 步骤 3 / 4：取假侧 —— 两个操作数都为假，整个条件为假，跳过该块
    expect(() => validateContext({ role: "tester", projectName: "bad name" })).toThrowError(new Error("projectName must match ^[A-Za-z0-9._-]+$"));
    expect(validateContext({ role: "tester", projectName: "piko" })).toBeUndefined();
  });
});
