/**
 * Case ID: UT-PI-680  ·  STATUS: real
 *
 * 责任：参数 `params: inferred` 的 `+1 拒绝` 类（skill-tools.ts:136）
 * 维度坐标：`execute` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-680.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0LookupTool, Mem0LookupSchema } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-680 · execute · 数值/长度上限参数 × +1 拒绝", () => {
  it("forwards a result count one above the schema maximum", async () => {  // forwards a result count one above the schema maximum
    // 步骤 1：按 `+1 拒绝` 类构造 params —— max_results 取上界 +1 = 21
    const fake = fakeMem0();
    const tool = createMem0LookupTool({ mem0: fake.mem0, context: skillContext() });
    // 步骤 2：调用 execute(…)
    const result = await runExecute(tool, { query: "q", max_results: 21 });
    // 步骤 3：断言真实行为 —— 偏差记录：schema 的 maximum=20 只在 typebox 校验层生效，
    //         execute 不做运行时校验，21 原样透传给 mem0（文档期望「抛 typed 错误」，
    //         实现不抛，也没有部分写入）
    expect(fake.calls.search).toHaveLength(1);
    expect(fake.calls.search[0]).toEqual({ query: "q", user_id: "tester:piko", options: { max_results: 21 } });
    expect(result).toEqual({ content: [{ type: "text", text: "[]" }], details: { count: 0 } });
    const schema = Mem0LookupSchema as unknown as {
      properties: { max_results: { minimum: number; maximum: number; default: number } };
    };
    expect(schema.properties.max_results.maximum).toBe(20);
  });
});
