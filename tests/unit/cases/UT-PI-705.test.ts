/**
 * Case ID: UT-PI-705  ·  STATUS: real
 *
 * 责任：参数 `_toolCallId: inferred` 的 `每等价类合法值` 类（skill-tools.ts:184）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-705.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0RecordTool } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext, fixedClock } from "./support/c-skilltools-fix.js";

describe("UT-PI-705 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("ignores the tool call id on every legal equivalence class", async () => {  // ignores the tool call id on every legal equivalence class
    // 步骤 1：按 `每等价类合法值` 类构造 `_toolCallId` —— 工具调用 id 的代表值
    const ids = ["call-1", "toolu_01ABC", "42"];
    const restore = fixedClock();
    try {
      for (const toolCallId of ids) {
        const fake = fakeMem0({ ids: ["m-1"] });
        const tool = createMem0RecordTool({ mem0: fake.mem0, context: skillContext() });
        // 步骤 2：调用 execute(…)
        const result = await runExecute(tool, { content: "## Lesson\nkeep it small" }, { toolCallId });
        // 步骤 3：逐值对账 —— toolCallId 既不进 mem0 的参数，也不进返回值
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
        expect(JSON.stringify(result)).not.toContain(toolCallId);
      }
    } finally {
      restore();
    }
  });
});
