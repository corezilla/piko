/**
 * Case ID: UT-PI-720  ·  STATUS: real
 *
 * 责任：参数 `_context: inferred` 的 `每等价类合法值` 类（skill-tools.ts:184）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-720.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0RecordTool } from "../../../src/skill-tools.js";
import { BACKGROUND_CONTEXT } from "../../../upstream/pi/packages/agent/src/harness/context.ts";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-720 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("ignores the background context", async () => {  // ignores the background context
    // 步骤 1：按 `每等价类合法值` 类构造 `_context` —— 后台上下文
    const fake = fakeMem0({ ids: ["m-1"] });
    const tool = createMem0RecordTool({ mem0: fake.mem0, context: skillContext() });
    // 步骤 2：调用 execute(…)
    const result = await runExecute(tool, { content: "## Lesson\nkeep it small" }, { context: BACKGROUND_CONTEXT });
    // 步骤 3：逐值对账 —— 工具不读 context，调用参数与返回值不受影响
    expect(result.details).toEqual({ ids: ["m-1"] });
    expect(fake.calls.add).toHaveLength(1);
  });
});
