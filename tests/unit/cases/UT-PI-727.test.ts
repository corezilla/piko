/**
 * Case ID: UT-PI-727  ·  STATUS: real
 *
 * 责任：返回站点 L203 值 `{ content: [{ type: "text", text: JSON.…` 逐值断言（skill-tools.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-727.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0RecordTool } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-727 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the success payload with every field value asserted", async () => {  // returns the success payload with every field value asserted
    // 步骤 1：构造使 skill-tools.ts:203 的返回站点被到达的输入 —— add 正常返回两个 id
    const fake = fakeMem0({ ids: ["m-1", "m-2"] });
    const tool = createMem0RecordTool({ mem0: fake.mem0, context: skillContext() });
    // 步骤 2：调用 execute(…)
    const result = await runExecute(tool, { content: "## Lesson\nkeep it small" });
    // 步骤 3：逐值对账（结构、字段、顺序）
    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify({ ids: ["m-1", "m-2"] }) }],
      details: { ids: ["m-1", "m-2"] },
    });
    expect(Object.keys(result)).toEqual(["content", "details"]);
    expect(Object.keys(result.content[0])).toEqual(["type", "text"]);
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toEqual({ ids: ["m-1", "m-2"] });
    expect(result.details.ids).toEqual(["m-1", "m-2"]);
    // 空 id 也是合法返回：details.ids 是空数组
    const empty = fakeMem0({ ids: [] });
    const emptyTool = createMem0RecordTool({ mem0: empty.mem0, context: skillContext() });
    expect(await runExecute(emptyTool, { content: "## Lesson\nkeep it small" })).toEqual({
      content: [{ type: "text", text: JSON.stringify({ ids: [] }) }],
      details: { ids: [] },
    });
  });
});
