/**
 * Case ID: UT-PI-704  ·  STATUS: real
 *
 * 责任：返回站点 L179 值 `{ name: "mem0_record", label: "Mem0 rec…` 逐值断言（skill-tools.ts）
 * 维度坐标：`createMem0RecordTool` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-704.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0RecordTool, Mem0RecordSchema } from "../../../src/skill-tools.js";
import { fakeMem0, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-704 · createMem0RecordTool · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the tool descriptor with every field value asserted", async () => {  // returns the tool descriptor with every field value asserted
    // 步骤 1：构造使 skill-tools.ts:179 的返回站点被到达的输入 —— 合法 context
    const fake = fakeMem0();
    // 步骤 2：调用 createMem0RecordTool(…)
    const tool = createMem0RecordTool({ mem0: fake.mem0, context: skillContext() });
    // 步骤 3：逐值对账返回对象（结构、字段、顺序）
    expect(Object.keys(tool)).toEqual(["name", "label", "description", "parameters", "execute"]);
    expect(tool.name).toBe("mem0_record");
    expect(tool.label).toBe("Mem0 record");
    expect(tool.description).toBe(
      "Record a new lesson learned this task. " +
        "Use when you encountered a pitfall, surprising behavior, or repeated mistake " +
        "worth remembering for next time. Skip routine successes. " +
        "Recommended structure: ## Situation / ## Failure / ## Lesson.",
    );
    // parameters 是同一个 schema 引用，且 schema 值逐字段对账
    expect(tool.parameters).toBe(Mem0RecordSchema);
    expect(tool.parameters).toEqual({
      type: "object",
      required: ["content"],
      properties: {
        content: {
          type: "string",
          description:
            "Markdown text describing the lesson learned. " +
            "Recommended structure: ## Situation (when this applies), ## Failure (what went wrong), " +
            "## Lesson (what to do instead). Skip if not worth recording.",
          minLength: 10,
          maxLength: 5000,
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Optional tags for filtering (e.g., ['async', 'auth', 'race-condition'])",
          maxItems: 10,
        },
      },
    });
    expect(typeof tool.execute).toBe("function");
    // 无未声明副作用：构造期不碰 mem0
    expect(fake.calls.search).toHaveLength(0);
    expect(fake.calls.add).toHaveLength(0);
  });
});
