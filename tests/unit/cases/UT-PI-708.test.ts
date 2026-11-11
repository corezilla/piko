/**
 * Case ID: UT-PI-708  ·  STATUS: real
 *
 * 责任：参数 `params: inferred` 的 `每等价类合法值` 类（skill-tools.ts:184）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-708.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0RecordTool } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext, fixedClock } from "./support/c-skilltools-fix.js";

describe("UT-PI-708 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("builds the memory payload for every legal equivalence class of params", async () => {  // builds the memory payload for every legal equivalence class of params
    const fake = fakeMem0({ ids: ["m-1"] });
    const tool = createMem0RecordTool({ mem0: fake.mem0, context: skillContext() });
    const restore = fixedClock();
    try {
      // 步骤 1：按 `每等价类合法值` 类构造 params —— content 取结构完整的 markdown；
      // tags 取「给一组」与「不给」两个等价类
      const content = "## Situation\n## Failure\n## Lesson";
      // 步骤 2：调用 execute(…)
      await runExecute(tool, { content, tags: ["async", "auth"] });
      // 步骤 3：逐值对账 —— messages / user_id / metadata 全部对上
      expect(fake.calls.add).toHaveLength(1);
      expect(fake.calls.add[0]).toEqual({
        messages: [{ role: "user", content }],
        user_id: "tester:piko",
        metadata: {
          type: "skill_experience",
          role: "tester",
          task_id: "task-1",
          recorded_at: "2026-01-01T00:00:00.000Z",
          tags: ["async", "auth"],
        },
      });
      // 另一个等价类：不带 tags
      const bare = fakeMem0({ ids: ["m-2"] });
      const bareTool = createMem0RecordTool({ mem0: bare.mem0, context: skillContext() });
      await runExecute(bareTool, { content });
      expect(bare.calls.add[0]).toEqual({
        messages: [{ role: "user", content }],
        user_id: "tester:piko",
        metadata: {
          type: "skill_experience",
          role: "tester",
          task_id: "task-1",
          recorded_at: "2026-01-01T00:00:00.000Z",
          tags: [],
        },
      });
    } finally {
      restore();
    }
  });
});
