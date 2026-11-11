/**
 * Case ID: UT-PI-712  ·  STATUS: real
 *
 * 责任：参数 `_onUpdate: inferred` 的 `边界(上/下/零/空/满)` 类（skill-tools.ts:184）
 * 维度坐标：`execute` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-712.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0RecordTool } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-712 · execute · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("never calls the boundary progress callbacks", async () => {  // never calls the boundary progress callbacks
    // 步骤 1：按 `边界(上/下/零/空/满)` 类构造 `_onUpdate`
    //   —— undefined（缺省）、null、以及无参空函数
    for (const onUpdate of [undefined, null, () => {}]) {
      const fake = fakeMem0({ ids: ["m-1"] });
      const tool = createMem0RecordTool({ mem0: fake.mem0, context: skillContext() });
      // 步骤 2：调用 execute(…)
      const result = await runExecute(tool, { content: "## Lesson\nkeep it small" }, { onUpdate });
      // 步骤 3：逐值对账 —— 边界回调既不被调用也不影响结果
      expect(result.details).toEqual({ ids: ["m-1"] });
      expect(fake.calls.add).toHaveLength(1);
    }
  });
});
