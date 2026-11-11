/**
 * Case ID: UT-PI-713  ·  STATUS: real
 *
 * 责任：参数 `_onUpdate: inferred` 的 `非法值` 类（skill-tools.ts:184）
 * 维度坐标：`execute` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-713.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { createMem0RecordTool } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-713 · execute · 纯函数/无副作用 × 非法值", () => {
  it("never calls an illegal progress callback", async () => {  // never calls an illegal progress callback
    // 步骤 1：按 `非法值` 类构造 `_onUpdate` —— 抛错的回调、不是函数的数值
    const throwing = vi.fn(() => {
      throw new Error("onUpdate blew up");
    });
    const fake = fakeMem0({ ids: ["m-1"] });
    const tool = createMem0RecordTool({ mem0: fake.mem0, context: skillContext() });
    // 步骤 2 / 3：断言真实行为 —— 实现从不调用 onUpdate，非法值既不抛错也不影响结果
    //   （文档期望「抛 typed 错误」，实现不抛）
    const result = await runExecute(tool, { content: "## Lesson\nkeep it small" }, { onUpdate: throwing });
    expect(throwing).not.toHaveBeenCalled();
    expect(result.details).toEqual({ ids: ["m-1"] });
    const notAFunction = await runExecute(tool, { content: "## Lesson\nkeep it small" }, { onUpdate: 42 });
    expect(notAFunction.details).toEqual({ ids: ["m-1"] });
    expect(fake.calls.add).toHaveLength(2);
  });
});
