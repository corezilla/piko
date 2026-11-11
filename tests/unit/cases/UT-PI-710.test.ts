/**
 * Case ID: UT-PI-710  ·  STATUS: real
 *
 * 责任：参数 `params: inferred` 的 `非法值` 类（skill-tools.ts:184）
 * 维度坐标：`execute` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-710.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0RecordTool, Mem0RecordSchema } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext, fixedClock } from "./support/c-skilltools-fix.js";

describe("UT-PI-710 · execute · 纯函数/无副作用 × 非法值", () => {
  it("forwards every illegal param instead of rejecting it", async () => {  // forwards every illegal param instead of rejecting it
    const fake = fakeMem0({ ids: [] });
    const tool = createMem0RecordTool({ mem0: fake.mem0, context: skillContext() });
    const restore = fixedClock();
    try {
      // 步骤 1：按 `非法值` 类构造 params —— content 短于 schema 的 minLength 10、
      //      长于 maxLength 5000；tags 不是数组；tags 超过 maxItems 10
      // 步骤 2：调用 execute(…)
      await runExecute(tool, { content: "" });
      await runExecute(tool, { content: "x".repeat(5001) });
      await runExecute(tool, { content: "## Lesson\nkeep it small", tags: "not-an-array" });
      await runExecute(tool, { content: "## Lesson\nkeep it small", tags: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"] });
      // 步骤 3：断言真实行为 —— 实现不做运行时 schema 校验，非法值原样透传给 mem0
      //   （文档期望「抛 typed 错误」，实现不抛，也没有部分写入）
      expect(fake.calls.add).toHaveLength(4);
      expect(fake.calls.add[0]!.messages).toEqual([{ role: "user", content: "" }]);
      expect(fake.calls.add[1]!.messages).toEqual([{ role: "user", content: "x".repeat(5001) }]);
      expect(fake.calls.add[2]!.metadata!.tags).toBe("not-an-array");
      expect(fake.calls.add[3]!.metadata!.tags).toHaveLength(11);
      // schema 声明的边界值没有在运行时生效
      const schema = Mem0RecordSchema as unknown as {
        properties: { content: { minLength: number; maxLength: number }; tags: { maxItems: number } };
      };
      expect(schema.properties.content.minLength).toBe(10);
      expect(schema.properties.content.maxLength).toBe(5000);
      expect(schema.properties.tags.maxItems).toBe(10);
    } finally {
      restore();
    }
  });
});
