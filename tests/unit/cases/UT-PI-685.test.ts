/**
 * Case ID: UT-PI-685  ·  STATUS: real
 *
 * 责任：参数 `_toolContext: inferred` 的 `每等价类合法值` 类（skill-tools.ts:136）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-685.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0LookupTool } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext, fakeToolContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-685 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("ignores a well formed tool context", async () => {  // ignores a well formed tool context
    // 步骤 1：按 `每等价类合法值` 类构造 `_toolContext` —— 合法形状的 ExecutionToolContext
    const toolContext = fakeToolContext();
    const fake = fakeMem0();
    const tool = createMem0LookupTool({ mem0: fake.mem0, context: skillContext() });
    // 步骤 2：调用 execute(…)
    const result = await runExecute(tool, { query: "q" }, { toolContext });
    // 步骤 3：逐值对账 —— 工具不读 toolContext，调用参数与返回值不受影响
    expect(result).toEqual({ content: [{ type: "text", text: "[]" }], details: { count: 0 } });
    expect(fake.calls.search[0]).toEqual({ query: "q", user_id: "tester:piko", options: { max_results: 5 } });
  });
});
