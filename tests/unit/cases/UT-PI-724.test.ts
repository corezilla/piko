/**
 * Case ID: UT-PI-724  ·  STATUS: real
 *
 * 责任：分支 L207 `catch (e)`（catch；skill-tools.ts）
 * 维度坐标：`execute` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-724.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0RecordTool } from "../../../src/skill-tools.js";
import { Mem0ApiError } from "../../../src/mem0-client.js";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-724 · execute · 错误路径 × 每个 typed 错误码", () => {
  it("takes the catch branch on both sides", async () => {  // takes the catch branch on both sides
    // 步骤 1：取真侧 —— add 拒绝，catch 被走到
    const failing = fakeMem0({ addError: new Mem0ApiError(500, "server_error", "boom") });
    const failingTool = createMem0RecordTool({ mem0: failing.mem0, context: skillContext() });
    // 步骤 2：调用 execute(…)
    const fallback = await runExecute(failingTool, { content: "## Lesson\nkeep it small" });
    // 观察：取真侧被走到 —— 返回降级结果，没有 ids
    expect(fallback).toEqual({
      content: [{ type: "text", text: "memory unavailable: server_error" }],
      details: { error: "server_error" },
    });
    expect(fallback.details).not.toHaveProperty("ids");
    // 步骤 3 / 4：取假侧 —— add 正常返回，catch 不被走到
    const ok = fakeMem0({ ids: ["m-1"] });
    const okTool = createMem0RecordTool({ mem0: ok.mem0, context: skillContext() });
    const success = await runExecute(okTool, { content: "## Lesson\nkeep it small" });
    expect(success.details).toEqual({ ids: ["m-1"] });
    expect(success.details).not.toHaveProperty("error");
  });
});
