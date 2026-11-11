/**
 * Case ID: UT-PI-682  ·  STATUS: real
 *
 * 责任：参数 `_onUpdate: inferred` 的 `每等价类合法值` 类（skill-tools.ts:136）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-682.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { createMem0LookupTool } from "../../../src/skill-tools.js";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-682 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("never calls the progress callback on every legal equivalence class", async () => {  // never calls the progress callback on every legal equivalence class
    // 步骤 1：按 `每等价类合法值` 类构造 `_onUpdate` —— 进度回调替身
    const onUpdate = vi.fn();
    const fake = fakeMem0();
    const tool = createMem0LookupTool({ mem0: fake.mem0, context: skillContext() });
    // 步骤 2：调用 execute(…)
    const result = await runExecute(tool, { query: "q" }, { onUpdate });
    // 步骤 3：逐值对账 —— 实现不流式输出，onUpdate 从未被调用，结果不受影响
    expect(onUpdate).not.toHaveBeenCalled();
    expect(result).toEqual({ content: [{ type: "text", text: "[]" }], details: { count: 0 } });
    expect(fake.calls.search[0]).toEqual({ query: "q", user_id: "tester:piko", options: { max_results: 5 } });
  });
});
