/**
 * Case ID: UT-PI-709  ·  STATUS: real
 *
 * 责任：参数 `params: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:184）
 * 维度坐标：`execute` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-709.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0RecordTool, Mem0RecordSchema } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext, fixedClock } from "./support/c-skilltools-fix.js";

describe("UT-PI-709 · execute · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("accepts the boundary content lengths and tag counts", async () => {  // accepts the boundary content lengths and tag counts
    const restore = fixedClock();
    try {
      // 步骤 1：按 `边界(上/下/零/空/满)` 类构造 params
      //   —— content 取 schema 的下界 10 字符与上界 5000 字符；
      //      tags 取零元素（空数组）与满 10 元素
      const minContent = "0123456789";
      const maxContent = "x".repeat(5000);
      const min = fakeMem0({ ids: ["m-min"] });
      const minTool = createMem0RecordTool({ mem0: min.mem0, context: skillContext() });
      // 步骤 2：调用 execute(…)
      await runExecute(minTool, { content: minContent, tags: [] });
      // 步骤 3：逐值对账 —— 下界 content 与零元素 tags 原样透传
      expect(min.calls.add[0]).toEqual({
        messages: [{ role: "user", content: minContent }],
        user_id: "tester:piko",
        metadata: {
          type: "skill_experience",
          role: "tester",
          task_id: "task-1",
          recorded_at: "2026-01-01T00:00:00.000Z",
          tags: [],
        },
      });
      // 上界 content 与满 10 元素 tags
      const fullTags = ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"];
      const max = fakeMem0({ ids: ["m-max"] });
      const maxTool = createMem0RecordTool({ mem0: max.mem0, context: skillContext() });
      await runExecute(maxTool, { content: maxContent, tags: fullTags });
      expect(max.calls.add[0]).toEqual({
        messages: [{ role: "user", content: maxContent }],
        user_id: "tester:piko",
        metadata: {
          type: "skill_experience",
          role: "tester",
          task_id: "task-1",
          recorded_at: "2026-01-01T00:00:00.000Z",
          tags: fullTags,
        },
      });
    } finally {
      restore();
    }
  });
});
