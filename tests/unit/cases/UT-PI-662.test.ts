/**
 * Case ID: UT-PI-662  ·  STATUS: real
 *
 * 责任：分支 L102 `!context.role`（!；skill-tools.ts）
 * 维度坐标：`validateContext` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-662.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateContext } from "../../../src/skill-tools.js";
import type { SkillToolContext } from "../../../src/skill-tools.js";

describe("UT-PI-662 · validateContext · 状态分支 × 合法迁移", () => {
  it("negates the role on both sides", async () => {  // negates the role on both sides
    // 步骤 1：构造使 `!context.role` 取真的输入
    //   —— role 为假（空串／0／null／undefined）
    for (const role of ["", 0, null, undefined]) {
      expect(() => validateContext({ role, projectName: "piko" } as unknown as SkillToolContext)).toThrowError(new Error("role required"));
    }
    // 步骤 3：构造使 `!context.role` 取假的输入 —— role 为真值
    // 步骤 4：断言取假侧 —— 块内的抛出没有发生，后续 projectName 校验接手
    expect(() => validateContext({ role: "tester", projectName: "" })).toThrowError(new Error("projectName required"));
    expect(validateContext({ role: "tester", projectName: "piko" })).toBeUndefined();
  });
});
