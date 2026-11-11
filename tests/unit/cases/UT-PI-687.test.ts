/**
 * Case ID: UT-PI-687  ·  STATUS: real
 *
 * 责任：参数 `_toolContext: inferred` 的 `非法值` 类（skill-tools.ts:136）
 * 维度坐标：`execute` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-687.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0LookupTool } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-687 · execute · 纯函数/无副作用 × 非法值", () => {
  it("accepts an illegal tool context without rejecting it", async () => {  // accepts an illegal tool context without rejecting it
    // 步骤 1：按 `非法值` 类构造 `_toolContext` —— null／undefined／数字
    // 步骤 2：调用 execute(…)
    // 步骤 3：断言真实行为 —— 实现从不读 toolContext，非法值被原样忽略，
    //         execute 仍然成功返回（文档期望「抛 typed 错误」，实现不抛）
    for (const toolContext of [null, undefined, 42]) {
      const fake = fakeMem0();
      const tool = createMem0LookupTool({ mem0: fake.mem0, context: skillContext() });
      const result = await runExecute(tool, { query: "q" }, { toolContext });
      expect(result).toEqual({ content: [{ type: "text", text: "[]" }], details: { count: 0 } });
      expect(fake.calls.search[0]).toEqual({ query: "q", user_id: "tester:piko", options: { max_results: 5 } });
    }
  });
});
