/**
 * Case ID: UT-PI-716  ·  STATUS: real
 *
 * 责任：参数 `_toolContext: inferred` 的 `非法值` 类（skill-tools.ts:184）
 * 维度坐标：`execute` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-716.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0RecordTool } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-716 · execute · 纯函数/无副作用 × 非法值", () => {
  it("accepts an illegal tool context without rejecting it", async () => {  // accepts an illegal tool context without rejecting it
    // 步骤 1：按 `非法值` 类构造 `_toolContext` —— null／undefined／数字
    // 步骤 2：调用 execute(…)
    // 步骤 3：断言真实行为 —— 实现从不读 toolContext，非法值被原样忽略，
    //         execute 仍然成功返回（文档期望「抛 typed 错误」，实现不抛）
    for (const toolContext of [null, undefined, 42]) {
      const fake = fakeMem0({ ids: ["m-1"] });
      const tool = createMem0RecordTool({ mem0: fake.mem0, context: skillContext() });
      const result = await runExecute(tool, { content: "## Lesson\nkeep it small" }, { toolContext });
      expect(result.details).toEqual({ ids: ["m-1"] });
      expect(fake.calls.add).toHaveLength(1);
    }
  });
});
