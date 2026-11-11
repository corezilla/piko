/**
 * Case ID: UT-PI-665  ·  STATUS: real
 *
 * 责任：分支 L105 `!context.projectName`（!；skill-tools.ts）
 * 维度坐标：`validateContext` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-665.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateContext } from "../../../src/skill-tools.js";
import type { SkillToolContext } from "../../../src/skill-tools.js";

describe("UT-PI-665 · validateContext · 状态分支 × 合法迁移", () => {
  it("negates the project name on both sides", async () => {  // negates the project name on both sides
    // 步骤 1：构造使 `!context.projectName` 取真的输入
    //   —— projectName 为假（空串／0／null／undefined）
    for (const projectName of ["", 0, null, undefined]) {
      expect(() => validateContext({ role: "tester", projectName } as unknown as SkillToolContext)).toThrowError(new Error("projectName required"));
    }
    // 步骤 3：构造使 `!context.projectName` 取假的输入 —— projectName 为真值
    // 步骤 4：断言取假侧 —— 块内的抛出没有发生，正则校验接手
    expect(() => validateContext({ role: "tester", projectName: "bad name" })).toThrowError(new Error("projectName must match ^[A-Za-z0-9._-]+$"));
    expect(validateContext({ role: "tester", projectName: "piko" })).toBeUndefined();
  });
});
