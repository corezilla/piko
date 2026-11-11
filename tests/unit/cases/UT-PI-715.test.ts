/**
 * Case ID: UT-PI-715  ·  STATUS: real
 *
 * 责任：参数 `_toolContext: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:184）
 * 维度坐标：`execute` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-715.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0RecordTool } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-715 · execute · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("ignores the boundary tool contexts", async () => {  // ignores the boundary tool contexts
    // 步骤 1：按 `边界(上/下/零/空/满)` 类构造 `_toolContext`
    //   —— 空对象、env 为 undefined、env 为空对象
    const boundaries = [{ env: undefined }, {}, { env: {} }];
    for (const toolContext of boundaries) {
      const fake = fakeMem0({ ids: ["m-1"] });
      const tool = createMem0RecordTool({ mem0: fake.mem0, context: skillContext() });
      // 步骤 2：调用 execute(…)
      const result = await runExecute(tool, { content: "## Lesson\nkeep it small" }, { toolContext });
      // 步骤 3：逐值对账 —— 边界上下文既不被读也不影响结果
      expect(result.details).toEqual({ ids: ["m-1"] });
      expect(fake.calls.add).toHaveLength(1);
    }
  });
});
