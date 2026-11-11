/**
 * Case ID: UT-PI-689  ·  STATUS: real
 *
 * 责任：参数 `_invocation: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:136）
 * 维度坐标：`execute` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-689.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0LookupTool } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext, fakeInvocation } from "./support/c-skilltools-fix.js";

describe("UT-PI-689 · execute · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("ignores the boundary invocations", async () => {  // ignores the boundary invocations
    // 步骤 1：按 `边界(上/下/零/空/满)` 类构造 `_invocation`
    //   —— id 为空串、id 很长
    const boundaries = [
      { invocationId: "", operationId: "", turnId: "" },
      { invocationId: "i".repeat(512), operationId: "o".repeat(512), turnId: "t".repeat(512) },
    ];
    for (const overrides of boundaries) {
      const invocation = fakeInvocation(overrides);
      const fake = fakeMem0();
      const tool = createMem0LookupTool({ mem0: fake.mem0, context: skillContext() });
      // 步骤 2：调用 execute(…)
      const result = await runExecute(tool, { query: "q" }, { invocation });
      // 步骤 3：逐值对账 —— 边界 invocation 既不被读也不影响结果
      expect(result).toEqual({ content: [{ type: "text", text: "[]" }], details: { count: 0 } });
      expect(fake.calls.search[0]).toEqual({ query: "q", user_id: "tester:piko", options: { max_results: 5 } });
    }
  });
});
