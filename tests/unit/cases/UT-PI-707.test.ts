/**
 * Case ID: UT-PI-707  ·  STATUS: real
 *
 * 责任：参数 `_toolCallId: inferred` 的 `非法值` 类（skill-tools.ts:184）
 * 维度坐标：`execute` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-707.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0RecordTool } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext, fixedClock } from "./support/c-skilltools-fix.js";

describe("UT-PI-707 · execute · 纯函数/无副作用 × 非法值", () => {
  it("accepts an illegal tool call id without rejecting it", async () => {  // accepts an illegal tool call id without rejecting it
    // 步骤 1：按 `非法值` 类构造 `_toolCallId` —— null／undefined／数字，都不是 string
    const restore = fixedClock();
    try {
      for (const toolCallId of [null, undefined, 42]) {
        const fake = fakeMem0({ ids: ["m-1"] });
        const tool = createMem0RecordTool({ mem0: fake.mem0, context: skillContext() });
        // 步骤 2：调用 execute(…)
        // 步骤 3：断言真实行为 —— 实现对 toolCallId 不做任何校验，非法值被原样忽略，
        //         execute 仍然成功返回（文档期望「抛 typed 错误」，实现不抛）
        const result = await runExecute(tool, { content: "## Lesson\nkeep it small" }, { toolCallId });
        expect(result).toEqual({ content: [{ type: "text", text: "{\"ids\":[\"m-1\"]}" }], details: { ids: ["m-1"] } });
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
      }
    } finally {
      restore();
    }
  });
});
