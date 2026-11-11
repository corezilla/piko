/**
 * Case ID: UT-PI-695  ·  STATUS: real
 *
 * 责任：分支 L148 `catch (e)`（catch；skill-tools.ts）
 * 维度坐标：`execute` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-695.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0LookupTool } from "../../../src/skill-tools.js";
import { Mem0ApiError } from "../../../src/mem0-client.js";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-695 · execute · 错误路径 × 每个 typed 错误码", () => {
  it("takes the catch branch on both sides", async () => {  // takes the catch branch on both sides
    // 步骤 1：取真侧 —— search 拒绝，catch 被走到
    const failing = fakeMem0({ searchError: new Mem0ApiError(500, "server_error", "boom") });
    const failingTool = createMem0LookupTool({ mem0: failing.mem0, context: skillContext() });
    // 步骤 2：调用 execute(…)
    const fallback = await runExecute(failingTool, { query: "q" });
    // 观察：取真侧被走到 —— 返回降级结果，没有 count
    expect(fallback).toEqual({
      content: [{ type: "text", text: "memory unavailable: server_error" }],
      details: { error: "server_error", status: 500 },
    });
    expect(fallback.details).not.toHaveProperty("count");
    // 步骤 3 / 4：取假侧 —— search 正常返回，catch 不被走到
    const results = [{ id: "m1", memory: "remember", score: 0.9, metadata: {}, created_at: "2026-01-01T00:00:00.000Z" }];
    const ok = fakeMem0({ results });
    const okTool = createMem0LookupTool({ mem0: ok.mem0, context: skillContext() });
    const success = await runExecute(okTool, { query: "q" });
    expect(success).toEqual({
      content: [{ type: "text", text: JSON.stringify(results) }],
      details: { count: 1 },
    });
    expect(success.details).not.toHaveProperty("error");
  });
});
