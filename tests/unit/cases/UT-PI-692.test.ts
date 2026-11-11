/**
 * Case ID: UT-PI-692  ·  STATUS: real
 *
 * 责任：参数 `_context: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:136）
 * 维度坐标：`execute` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-692.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0LookupTool } from "../../../src/skill-tools.js";
import { BACKGROUND_CONTEXT, TODO_CONTEXT } from "../../../upstream/pi/packages/agent/src/harness/context.ts";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-692 · execute · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("ignores the boundary contexts", async () => {  // ignores the boundary contexts
    // 步骤 1：按 `边界(上/下/零/空/满)` 类构造 `_context` —— 另一个内建上下文
    const fake = fakeMem0();
    const tool = createMem0LookupTool({ mem0: fake.mem0, context: skillContext() });
    // 步骤 2：调用 execute(…)
    const result = await runExecute(tool, { query: "q" }, { context: TODO_CONTEXT });
    // 步骤 3：逐值对账 —— 换上下文不影响调用参数与返回值
    expect(result).toEqual({ content: [{ type: "text", text: "[]" }], details: { count: 0 } });
    expect(fake.calls.search[0]).toEqual({ query: "q", user_id: "tester:piko", options: { max_results: 5 } });
  });
});
