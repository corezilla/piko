/**
 * Case ID: UT-PI-667  ·  STATUS: real
 *
 * 责任：分支 L108 `!/^[A-Za-z0-9._-]+$/.test(context.projectName)`（!；skill-tools.ts）
 * 维度坐标：`validateContext` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-667.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateContext } from "../../../src/skill-tools.js";
import type { SkillToolContext } from "../../../src/skill-tools.js";

describe("UT-PI-667 · validateContext · 状态分支 × 合法迁移", () => {
  it("negates the project name pattern on both sides", async () => {  // negates the project name pattern on both sides
    // 步骤 1：构造使 `!/^[A-Za-z0-9._-]+$/.test(context.projectName)` 取真的输入
    //   —— test() 返回 false（不匹配）
    // 步骤 2：调用 validateContext(…) 并断言取真侧的可观测结果
    expect(() => validateContext({ role: "tester", projectName: "项目" })).toThrowError(new Error("projectName must match ^[A-Za-z0-9._-]+$"));
    expect(() => validateContext({ role: "tester", projectName: "a b" })).toThrowError(new Error("projectName must match ^[A-Za-z0-9._-]+$"));
    // 步骤 3：构造使该分支取假的输入 —— test() 返回 true（匹配）
    // 步骤 4：断言取假侧 —— 跳过该块，函数正常返回
    expect(validateContext({ role: "tester", projectName: "ok.name-1_2" })).toBeUndefined();
    // 逐值对账：判据的正则本身对边界字符的判定
    expect(/^[A-Za-z0-9._-]+$/.test("a")).toBe(true);
    expect(/^[A-Za-z0-9._-]+$/.test("")).toBe(false);
    expect(/^[A-Za-z0-9._-]+$/.test("a b")).toBe(false);
  });
});
