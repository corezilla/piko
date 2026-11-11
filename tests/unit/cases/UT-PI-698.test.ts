/**
 * Case ID: UT-PI-698  ·  STATUS: real
 *
 * 责任：返回站点 L144 值 `{ content: [{ type: "text", text: JSON.…` 逐值断言（skill-tools.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-698.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0LookupTool } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-698 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the success payload with every field value asserted", async () => {  // returns the success payload with every field value asserted
    // 步骤 1：构造使 skill-tools.ts:144 的返回站点被到达的输入 —— search 正常返回两条
    const results = [
      { id: "m1", memory: "first lesson", score: 0.91, metadata: { tags: ["auth"] }, created_at: "2026-01-02T03:04:05.000Z" },
      { id: "m2", memory: "second lesson", score: 0.42, metadata: {}, created_at: "2026-01-02T03:04:06.000Z" },
    ];
    const fake = fakeMem0({ results });
    const tool = createMem0LookupTool({ mem0: fake.mem0, context: skillContext() });
    // 步骤 2：调用 execute(…)
    const result = await runExecute(tool, { query: "auth pitfall" });
    // 步骤 3：逐值对账（结构、字段、顺序）
    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify(results) }],
      details: { count: 2 },
    });
    expect(Object.keys(result)).toEqual(["content", "details"]);
    expect(Object.keys(result.content[0])).toEqual(["type", "text"]);
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toEqual(results);
    expect(result.details.count).toBe(results.length);
    // 空结果也是合法返回：count = 0
    const empty = fakeMem0({ results: [] });
    const emptyTool = createMem0LookupTool({ mem0: empty.mem0, context: skillContext() });
    expect(await runExecute(emptyTool, { query: "q" })).toEqual({ content: [{ type: "text", text: "[]" }], details: { count: 0 } });
  });
});
