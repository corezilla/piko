/**
 * Case ID: UT-PI-706  ·  STATUS: real
 *
 * 责任：参数 `_toolCallId: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:184）
 * 维度坐标：`execute` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-706.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0RecordTool } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext, fixedClock } from "./support/c-skilltools-fix.js";

describe("UT-PI-706 · execute · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("ignores the boundary tool call ids", async () => {  // ignores the boundary tool call ids
    // 步骤 1：按 `边界(上/下/零/空/满)` 类构造 `_toolCallId`
    //   —— 空串、纯空白、超长 id、非 ASCII id
    const ids = ["", "   ", "x".repeat(1024), "调用-1"];
    const restore = fixedClock();
    try {
      for (const toolCallId of ids) {
        const fake = fakeMem0({ ids: ["m-1"] });
        const tool = createMem0RecordTool({ mem0: fake.mem0, context: skillContext() });
        // 步骤 2：调用 execute(…)
        const result = await runExecute(tool, { content: "## Lesson\nkeep it small" }, { toolCallId });
        // 步骤 3：逐值对账 —— 边界 id 一样不影响调用参数与返回值
        expect(fake.calls.add).toHaveLength(1);
        expect(fake.calls.add[0]).toEqual({
      messages: [{ role: "user", content: "## Lesson\nkeep it small" }],
      user_id: "tester:piko",
      metadata: {
        type: "skill_experience",
        role: "tester",
        task_id: "task-1",
        recorded_at: "2026-01-01T00:00:00.000Z",
        tags: [],
      },
    });
        expect(result).toEqual({ content: [{ type: "text", text: "{\"ids\":[\"m-1\"]}" }], details: { ids: ["m-1"] } });
      }
    } finally {
      restore();
    }
  });
});
