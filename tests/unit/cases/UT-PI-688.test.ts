/**
 * Case ID: UT-PI-688  ·  STATUS: real
 *
 * 责任：参数 `_invocation: inferred` 的 `每等价类合法值` 类（skill-tools.ts:136）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-688.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0LookupTool } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext, fakeInvocation } from "./support/c-skilltools-fix.js";

describe("UT-PI-688 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("ignores a well formed invocation", async () => {  // ignores a well formed invocation
    // 步骤 1：按 `每等价类合法值` 类构造 `_invocation` —— 合法形状的调用上下文
    const invocation = fakeInvocation();
    const fake = fakeMem0();
    const tool = createMem0LookupTool({ mem0: fake.mem0, context: skillContext() });
    // 步骤 2：调用 execute(…)
    const result = await runExecute(tool, { query: "q" }, { invocation });
    // 步骤 3：逐值对账 —— 工具不读 invocation，调用参数与返回值不受影响
    expect(result).toEqual({ content: [{ type: "text", text: "[]" }], details: { count: 0 } });
    expect(fake.calls.search[0]).toEqual({ query: "q", user_id: "tester:piko", options: { max_results: 5 } });
  });
});
