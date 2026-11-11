/**
 * Case ID: UT-PI-660  ·  STATUS: real
 *
 * 责任：分支 L102 `if (!context.role || context.role.trim() === …`（if；skill-tools.ts）
 * 维度坐标：`validateContext` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-660.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateContext } from "../../../src/skill-tools.js";
import type { SkillToolContext } from "../../../src/skill-tools.js";

describe("UT-PI-660 · validateContext · 状态分支 × 合法迁移", () => {
  it("takes the role guard on both sides", async () => {  // takes the role guard on both sides
    // 步骤 1：构造使 skill-tools.ts:102 的 if 取真的输入
    //   —— role 为空串或只含空白
    // 步骤 2：调用 validateContext(…) 并断言取真侧的可观测结果
    expect(() => validateContext({ role: "", projectName: "piko" })).toThrowError(new Error("role required"));
    expect(() => validateContext({ role: "   ", projectName: "piko" })).toThrowError(new Error("role required"));
    // 步骤 3：构造使该分支取假的输入 —— role 为真值
    // 步骤 4：断言取假侧 —— 跳过该块，后续 projectName 校验接手；role 合法时整体不抛
    expect(() => validateContext({ role: "tester", projectName: "" })).toThrowError(new Error("projectName required"));
    expect(validateContext({ role: "tester", projectName: "piko" })).toBeUndefined();
  });
});
