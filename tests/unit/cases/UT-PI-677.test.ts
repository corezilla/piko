/**
 * Case ID: UT-PI-677  ·  STATUS: real
 *
 * 责任：参数 `_toolCallId: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:136）
 * 维度坐标：`execute` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-677.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0LookupTool } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-677 · execute · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("ignores the boundary tool call ids", async () => {  // ignores the boundary tool call ids
    // 步骤 1：按 `边界(上/下/零/空/满)` 类构造 `_toolCallId`
    //   —— 空串、纯空白、超长 id、非 ASCII id
    const ids = ["", "   ", "x".repeat(1024), "调用-1"];
    for (const toolCallId of ids) {
      const fake = fakeMem0();
      const tool = createMem0LookupTool({ mem0: fake.mem0, context: skillContext() });
      // 步骤 2：调用 execute(…)
      const result = await runExecute(tool, { query: "q" }, { toolCallId });
      // 步骤 3：逐值对账 —— 边界 id 一样不影响调用参数与返回值
      expect(fake.calls.search).toHaveLength(1);
      expect(fake.calls.search[0]).toEqual({ query: "q", user_id: "tester:piko", options: { max_results: 5 } });
      expect(result).toEqual({ content: [{ type: "text", text: "[]" }], details: { count: 0 } });
    }
  });
});
