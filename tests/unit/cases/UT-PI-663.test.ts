/**
 * Case ID: UT-PI-663  ·  STATUS: real
 *
 * 责任：分支 L105 `if (!context.projectName || context.projectNa…`（if；skill-tools.ts）
 * 维度坐标：`validateContext` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-663.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateContext } from "../../../src/skill-tools.js";
import type { SkillToolContext } from "../../../src/skill-tools.js";

describe("UT-PI-663 · validateContext · 状态分支 × 合法迁移", () => {
  it("takes the project name guard on both sides", async () => {  // takes the project name guard on both sides
    // 步骤 1：构造使 skill-tools.ts:105 的 if 取真的输入
    //   —— projectName 为空串或只含空白
    // 步骤 2：调用 validateContext(…) 并断言取真侧的可观测结果
    expect(() => validateContext({ role: "tester", projectName: "" })).toThrowError(new Error("projectName required"));
    expect(() => validateContext({ role: "tester", projectName: "   " })).toThrowError(new Error("projectName required"));
    // 步骤 3：构造使该分支取假的输入 —— projectName 非空且 trim 后非空
    // 步骤 4：断言取假侧 —— 跳过该块，落到正则校验；合法项目名整体不抛
    expect(() => validateContext({ role: "tester", projectName: "bad name" })).toThrowError(new Error("projectName must match ^[A-Za-z0-9._-]+$"));
    expect(validateContext({ role: "tester", projectName: "piko" })).toBeUndefined();
  });
});
