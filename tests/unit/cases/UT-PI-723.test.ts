/**
 * Case ID: UT-PI-723  ·  STATUS: real
 *
 * 责任：分支 L194 `params.tags ?? []`（??；skill-tools.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-723.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0RecordTool } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext, fixedClock } from "./support/c-skilltools-fix.js";

describe("UT-PI-723 · execute · 状态分支 × 合法迁移", () => {
  it("takes the default tag list branch on both sides", async () => {  // takes the default tag list branch on both sides
    const restore = fixedClock();
    try {
      // 步骤 1：取真侧 —— tags 为 nullish（undefined／null），`?? []` 生效
      for (const tags of [undefined, null]) {
        const fake = fakeMem0({ ids: ["m-1"] });
        const tool = createMem0RecordTool({ mem0: fake.mem0, context: skillContext() });
        // 步骤 2：调用 execute(…)
        await runExecute(tool, { content: "## Lesson\nkeep it small", tags });
        // 观察：取真侧被走到 —— metadata.tags 是空数组
        expect(fake.calls.add[0]!.metadata!.tags).toEqual([]);
      }
      // 步骤 3 / 4：取假侧 —— tags 有值，直接采用，不回落默认
      const fake = fakeMem0({ ids: ["m-1"] });
      const tool = createMem0RecordTool({ mem0: fake.mem0, context: skillContext() });
      await runExecute(tool, { content: "## Lesson\nkeep it small", tags: ["async"] });
      expect(fake.calls.add[0]!.metadata!.tags).toEqual(["async"]);
    } finally {
      restore();
    }
  });
});
