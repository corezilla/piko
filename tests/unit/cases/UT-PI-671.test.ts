/**
 * Case ID: UT-PI-671  ·  STATUS: real
 *
 * 责任：参数 `deps: SkillToolDeps` 的 `每等价类合法值` 类（skill-tools.ts:123）
 * 维度坐标：`createMem0LookupTool` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-671.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0LookupTool } from "../../../src/skill-tools.js";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { fakeMem0, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-671 · createMem0LookupTool · 纯函数/无副作用 × 每等价类合法值", () => {
  it("builds the tool for every legal equivalence class of deps", async () => {  // builds the tool for every legal equivalence class of deps
    // 步骤 1：按 `每等价类合法值` 类构造 deps —— mem0 取「真实适配器」与
    // 「结构相同的替身」两个等价类；context 取「带 taskId」与「不带 taskId」两个等价类
    const real = new Mem0Adapter("https://mem0.test", "key");
    const fake = fakeMem0();
    const legal = [
      { mem0: real, context: skillContext({ role: "tester", projectName: "piko" }) },
      { mem0: fake.mem0, context: skillContext({ role: "developer", projectName: "my-project", taskId: "task-1" }) },
      { mem0: real, context: skillContext({ role: "ops", projectName: "a" }) },
    ];
    // 步骤 2：调用 createMem0LookupTool(…)
    // 步骤 3：逐值对账 —— 返回工具对象；构造期不碰 mem0（不发生任何网络调用）
    for (const deps of legal) {
      const tool = createMem0LookupTool(deps);
      expect(tool.name).toBe("mem0_lookup");
      expect(tool.label).toBe("Mem0 lookup");
      expect(typeof tool.description).toBe("string");
      expect(typeof tool.execute).toBe("function");
    }
    expect(fake.calls.search).toHaveLength(0);
    expect(fake.calls.add).toHaveLength(0);
  });
});
