/**
 * Case ID: UT-PI-694  ·  STATUS: real
 *
 * 责任：分支 L142 `params.max_results ?? 5`（??；skill-tools.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-694.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0LookupTool } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-694 · execute · 状态分支 × 合法迁移", () => {
  it("takes the default result count branch on both sides", async () => {  // takes the default result count branch on both sides
    // 步骤 1：取真侧 —— max_results 为 nullish（undefined／null），`?? 5` 生效
    for (const max_results of [undefined, null]) {
      const fake = fakeMem0();
      const tool = createMem0LookupTool({ mem0: fake.mem0, context: skillContext() });
      // 步骤 2：调用 execute(…)
      await runExecute(tool, { query: "q", max_results });
      // 观察：取真侧被走到 —— mem0 收到默认值 5
      expect(fake.calls.search[0]).toEqual({ query: "q", user_id: "tester:piko", options: { max_results: 5 } });
    }
    // 步骤 3 / 4：取假侧 —— max_results 有值，直接采用，不回落默认
    const fake = fakeMem0();
    const tool = createMem0LookupTool({ mem0: fake.mem0, context: skillContext() });
    await runExecute(tool, { query: "q", max_results: 7 });
    expect(fake.calls.search[0]).toEqual({ query: "q", user_id: "tester:piko", options: { max_results: 7 } });
  });
});
