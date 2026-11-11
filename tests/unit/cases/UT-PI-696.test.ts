/**
 * Case ID: UT-PI-696  ·  STATUS: real
 *
 * 责任：分支 L149 `if (e instanceof Mem0ApiError)`（if；skill-tools.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-696.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0LookupTool } from "../../../src/skill-tools.js";
import { Mem0ApiError } from "../../../src/mem0-client.js";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-696 · execute · 状态分支 × 合法迁移", () => {
  it("takes the mem0 api error branch on both sides", async () => {  // takes the mem0 api error branch on both sides
    // 步骤 1：取真侧 —— 抛出的是 Mem0ApiError 实例，走降级分支
    const apiError = new Mem0ApiError(404, "not_found", "missing");
    const fake = fakeMem0({ searchError: apiError });
    const tool = createMem0LookupTool({ mem0: fake.mem0, context: skillContext() });
    // 步骤 2：调用 execute(…)
    const degraded = await runExecute(tool, { query: "q" });
    // 观察：取真侧被走到 —— code 与 status 逐值进入 details
    expect(degraded).toEqual({
      content: [{ type: "text", text: "memory unavailable: not_found" }],
      details: { error: "not_found", status: 404 },
    });
    // 步骤 3 / 4：取假侧 —— 不是 Mem0ApiError，原样上抛
    const plain = new Error("not a mem0 error");
    const plainFake = fakeMem0({ searchError: plain });
    const plainTool = createMem0LookupTool({ mem0: plainFake.mem0, context: skillContext() });
    await expect(runExecute(plainTool, { query: "q" })).rejects.toBe(plain);
  });
});
