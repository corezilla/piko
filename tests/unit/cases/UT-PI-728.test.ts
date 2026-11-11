/**
 * Case ID: UT-PI-728  ·  STATUS: real
 *
 * 责任：返回站点 L209 值 `{ content: [{ type: "text", text: `memo…` 逐值断言（skill-tools.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-728.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0RecordTool } from "../../../src/skill-tools.js";
import { Mem0ApiError } from "../../../src/mem0-client.js";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-728 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the fallback payload with every field value asserted", async () => {  // returns the fallback payload with every field value asserted
    // 步骤 1：构造使 skill-tools.ts:209 的返回站点被到达的输入 —— add 抛 Mem0ApiError
    const fake = fakeMem0({ addError: new Mem0ApiError(429, "rate_limited", "slow down") });
    const tool = createMem0RecordTool({ mem0: fake.mem0, context: skillContext() });
    // 步骤 2：调用 execute(…)
    const result = await runExecute(tool, { content: "## Lesson\nkeep it small" });
    // 步骤 3：逐值对账（结构、字段、顺序）
    expect(result).toEqual({
      content: [{ type: "text", text: "memory unavailable: rate_limited" }],
      details: { error: "rate_limited" },
    });
    expect(Object.keys(result)).toEqual(["content", "details"]);
    expect(Object.keys(result.content[0])).toEqual(["type", "text"]);
    expect(Object.keys(result.details)).toEqual(["error"]);
    // record 侧的 details 没有 status（与 lookup 侧不同）
    expect(result.details).not.toHaveProperty("status");
    expect(result.details).not.toHaveProperty("ids");
    // 网络层错误：code 保真
    const network = fakeMem0({ addError: new Mem0ApiError(0, "network", "offline") });
    const networkTool = createMem0RecordTool({ mem0: network.mem0, context: skillContext() });
    expect(await runExecute(networkTool, { content: "## Lesson\nkeep it small" })).toEqual({
      content: [{ type: "text", text: "memory unavailable: network" }],
      details: { error: "network" },
    });
  });
});
