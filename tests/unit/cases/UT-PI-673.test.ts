/**
 * Case ID: UT-PI-673  ·  STATUS: real
 *
 * 责任：参数 `deps: SkillToolDeps` 的 `非法值` 类（skill-tools.ts:123）
 * 维度坐标：`createMem0LookupTool` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-673.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0LookupTool } from "../../../src/skill-tools.js";
import { fakeMem0, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-673 · createMem0LookupTool · 纯函数/无副作用 × 非法值", () => {
  it("rejects every illegal deps at construction time without touching mem0", async () => {  // rejects every illegal deps at construction time without touching mem0
    const fake = fakeMem0();
    // 步骤 1：按 `非法值` 类构造 deps —— 非法 role（null／0）与非法 projectName
    // （含空格／斜杠／非 ASCII）
    const illegal = [
      { label: "role=null", context: { role: null, projectName: "piko" }, message: "role required" },
      { label: "role=0", context: { role: 0, projectName: "piko" }, message: "role required" },
      { label: "projectName=null", context: { role: "tester", projectName: null }, message: "projectName required" },
      { label: "projectName 含空格", context: { role: "tester", projectName: "my project" }, message: "projectName must match ^[A-Za-z0-9._-]+$" },
      { label: "projectName 含斜杠", context: { role: "tester", projectName: "my/project" }, message: "projectName must match ^[A-Za-z0-9._-]+$" },
      { label: "projectName 非 ASCII", context: { role: "tester", projectName: "项目" }, message: "projectName must match ^[A-Za-z0-9._-]+$" },
    ];
    // 步骤 2：调用 createMem0LookupTool(…)
    // 步骤 3：逐值对账 —— 构造期抛出对应错误，且 mem0 从未被调用（无状态写／资源残留）
    const actual = illegal.map(({ context }) => {
      try {
        createMem0LookupTool({ mem0: fake.mem0, context: context as never });
        return "no throw";
      } catch (e) {
        return (e as Error).message;
      }
    });
    expect(actual).toEqual(illegal.map((entry) => entry.message));
    expect(fake.calls.search).toHaveLength(0);
    expect(fake.calls.add).toHaveLength(0);
  });
});
