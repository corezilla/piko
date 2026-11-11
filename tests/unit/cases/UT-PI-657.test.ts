/**
 * Case ID: UT-PI-657  ·  STATUS: real
 *
 * 责任：参数 `context: SkillToolContext` 的 `每等价类合法值` 类（skill-tools.ts:101）
 * 维度坐标：`validateContext` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-657.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { validateContext } from "../../../src/skill-tools.js";
import type { SkillToolContext } from "../../../src/skill-tools.js";

describe("UT-PI-657 · validateContext · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts every legal equivalence class of the context", async () => {  // accepts every legal equivalence class of the context
    // 步骤 1：按 `每等价类合法值` 类构造 context —— role 取类型定义里的角色名，
    // projectName 取符合 /^[A-Za-z0-9._-]+$/ 的项目名；taskId 是可选字段。
    const legal: SkillToolContext[] = [
      { role: "tester", projectName: "piko" },
      { role: "developer", projectName: "my-project" },
      { role: "reviewer", projectName: "my_project.v2" },
      { role: "ops", projectName: "a" },
      { role: "tester", projectName: "piko", taskId: "task-1" },
    ];
    const before = JSON.stringify(legal);
    // 步骤 2：调用 validateContext(…)
    // 步骤 3：逐值对账 —— 全部被接受，返回值为 undefined（void 语义），
    // 且入参不被改写（纯函数，无状态写）
    for (const context of legal) {
      expect(validateContext(context)).toBeUndefined();
    }
    expect(JSON.stringify(legal)).toBe(before);
  });
});
