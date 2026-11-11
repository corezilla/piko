/**
 * Case ID: UT-PI-681  ·  STATUS: real
 *
 * 责任：参数 `params: inferred` 的 `−1 通过` 类（skill-tools.ts:136）
 * 维度坐标：`execute` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-681.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0LookupTool, Mem0LookupSchema } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-681 · execute · 数值/长度上限参数 × −1 通过", () => {
  it("forwards the result count one below the schema maximum", async () => {  // forwards the result count one below the schema maximum
    // 步骤 1：按 `−1 通过` 类构造 params —— max_results 取上界 −1 = 19
    const fake = fakeMem0();
    const tool = createMem0LookupTool({ mem0: fake.mem0, context: skillContext() });
    // 步骤 2：调用 execute(…)
    const result = await runExecute(tool, { query: "q", max_results: 19 });
    // 步骤 3：逐值对账 —— 19 原样透传给 mem0
    expect(fake.calls.search[0]).toEqual({ query: "q", user_id: "tester:piko", options: { max_results: 19 } });
    expect(result).toEqual({ content: [{ type: "text", text: "[]" }], details: { count: 0 } });
    // 判据来源：schema 的上界／下界
    const schema = Mem0LookupSchema as unknown as {
      properties: { max_results: { minimum: number; maximum: number; default: number } };
    };
    expect(schema.properties.max_results.maximum).toBe(20);
    expect(schema.properties.max_results.minimum).toBe(1);
  });
});
