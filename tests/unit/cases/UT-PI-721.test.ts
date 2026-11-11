/**
 * Case ID: UT-PI-721  ·  STATUS: real
 *
 * 责任：参数 `_context: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:184）
 * 维度坐标：`execute` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-721.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0RecordTool } from "../../../src/skill-tools.js";
import { BACKGROUND_CONTEXT, TODO_CONTEXT } from "../../../upstream/pi/packages/agent/src/harness/context.ts";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-721 · execute · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("ignores the boundary contexts", async () => {  // ignores the boundary contexts
    // 步骤 1：按 `边界(上/下/零/空/满)` 类构造 `_context` —— 另一个内建上下文
    const fake = fakeMem0({ ids: ["m-1"] });
    const tool = createMem0RecordTool({ mem0: fake.mem0, context: skillContext() });
    // 步骤 2：调用 execute(…)
    const result = await runExecute(tool, { content: "## Lesson\nkeep it small" }, { context: TODO_CONTEXT });
    // 步骤 3：逐值对账 —— 换上下文不影响调用参数与返回值
    expect(result.details).toEqual({ ids: ["m-1"] });
    expect(fake.calls.add).toHaveLength(1);
  });
});
