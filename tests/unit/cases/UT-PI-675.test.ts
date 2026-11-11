/**
 * Case ID: UT-PI-675  ·  STATUS: real
 *
 * 责任：返回站点 L131 值 `{ name: "mem0_lookup", label: "Mem0 loo…` 逐值断言（skill-tools.ts）
 * 维度坐标：`createMem0LookupTool` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-675.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0LookupTool, Mem0LookupSchema } from "../../../src/skill-tools.js";
import { fakeMem0, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-675 · createMem0LookupTool · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the tool descriptor with every field value asserted", async () => {  // returns the tool descriptor with every field value asserted
    // 步骤 1：构造使 skill-tools.ts:131 的返回站点被到达的输入 —— 合法 context
    const fake = fakeMem0();
    // 步骤 2：调用 createMem0LookupTool(…)
    const tool = createMem0LookupTool({ mem0: fake.mem0, context: skillContext() });
    // 步骤 3：逐值对账返回对象（结构、字段、顺序）
    expect(Object.keys(tool)).toEqual(["name", "label", "description", "parameters", "execute"]);
    expect(tool.name).toBe("mem0_lookup");
    expect(tool.label).toBe("Mem0 lookup");
    expect(tool.description).toBe(
      "Search past skill experience for the current role in this project. " +
        "Use this when you want to know what has been learned before — e.g., test pitfalls, " +
        "code conventions, project-specific quirks, repeated failures. " +
        "Returns up to N relevant experiences with their original situation / failure / lesson.",
    );
    // parameters 是同一个 schema 引用，且 schema 值逐字段对账
    expect(tool.parameters).toBe(Mem0LookupSchema);
    expect(tool.parameters).toEqual({
      type: "object",
      required: ["query"],
      properties: {
        query: {
          type: "string",
          description:
            "Natural language search query for past skill experience. " +
            "Be specific: include module name, scenario, or failure pattern.",
          minLength: 1,
          maxLength: 500,
        },
        max_results: {
          type: "number",
          description: "Maximum number of experiences to return. Default 5, max 20.",
          default: 5,
          minimum: 1,
          maximum: 20,
        },
      },
    });
    expect(typeof tool.execute).toBe("function");
    // 无未声明副作用：构造期不碰 mem0
    expect(fake.calls.search).toHaveLength(0);
    expect(fake.calls.add).toHaveLength(0);
  });
});
