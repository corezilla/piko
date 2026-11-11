/**
 * Case ID: UT-PI-659  ·  STATUS: real
 *
 * 责任：参数 `context: SkillToolContext` 的 `非法值` 类（skill-tools.ts:101）
 * 维度坐标：`validateContext` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-659.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateContext } from "../../../src/skill-tools.js";
import type { SkillToolContext } from "../../../src/skill-tools.js";

describe("UT-PI-659 · validateContext · 纯函数/无副作用 × 非法值", () => {
  it("rejects every illegal value of the context with the matching error message", async () => {  // rejects every illegal value of the context with the matching error message
    // 步骤 1：按 `非法值` 类构造 context —— 空值（null／undefined／0）与
    // 违反 /^[A-Za-z0-9._-]+$/ 的 projectName。
    const illegal: Array<{ label: string; context: SkillToolContext; message: string }> = [
      { label: "role=null", context: { role: null, projectName: "piko" } as unknown as SkillToolContext, message: "role required" },
      { label: "role=undefined", context: { role: undefined, projectName: "piko" } as unknown as SkillToolContext, message: "role required" },
      { label: "role=0", context: { role: 0, projectName: "piko" } as unknown as SkillToolContext, message: "role required" },
      { label: "projectName=null", context: { role: "tester", projectName: null } as unknown as SkillToolContext, message: "projectName required" },
      { label: "projectName=undefined", context: { role: "tester", projectName: undefined } as unknown as SkillToolContext, message: "projectName required" },
      { label: "projectName=0", context: { role: "tester", projectName: 0 } as unknown as SkillToolContext, message: "projectName required" },
      { label: "projectName 含空格", context: { role: "tester", projectName: "my project" }, message: "projectName must match ^[A-Za-z0-9._-]+$" },
      { label: "projectName 含斜杠", context: { role: "tester", projectName: "my/project" }, message: "projectName must match ^[A-Za-z0-9._-]+$" },
      { label: "projectName 非 ASCII", context: { role: "tester", projectName: "项目" }, message: "projectName must match ^[A-Za-z0-9._-]+$" },
    ];
    // 步骤 2：调用 validateContext(…)
    // 步骤 3：逐值对账 —— 每个非法值都抛出对应消息，且入参不被改写（无状态写／资源残留）
    const actual = illegal.map(({ context }) => {
      try {
        validateContext(context);
        return "no throw";
      } catch (e) {
        return (e as Error).message;
      }
    });
    expect(actual).toEqual(illegal.map((entry) => entry.message));
    const before = JSON.stringify(illegal.map((entry) => entry.context));
    for (const { context } of illegal) {
      try {
        validateContext(context);
      } catch {
        /* 预期抛出 */
      }
    }
    expect(JSON.stringify(illegal.map((entry) => entry.context))).toBe(before);
  });
});
