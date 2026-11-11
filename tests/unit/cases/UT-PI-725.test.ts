/**
 * Case ID: UT-PI-725  ·  STATUS: real
 *
 * 责任：分支 L208 `if (e instanceof Mem0ApiError)`（if；skill-tools.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-725.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { createMem0RecordTool } from "../../../src/skill-tools.js";
import { Mem0ApiError } from "../../../src/mem0-client.js";
import { fakeMem0, runExecute, skillContext } from "./support/c-skilltools-fix.js";

describe("UT-PI-725 · execute · 状态分支 × 合法迁移", () => {
  it("takes the mem0 api error branch on both sides", async () => {  // takes the mem0 api error branch on both sides
    // 步骤 1：取真侧 —— 抛出的是 Mem0ApiError 实例，走降级分支
    const apiError = new Mem0ApiError(404, "not_found", "missing");
    const fake = fakeMem0({ addError: apiError });
    const tool = createMem0RecordTool({ mem0: fake.mem0, context: skillContext() });
    // 步骤 2：调用 execute(…)
    const degraded = await runExecute(tool, { content: "## Lesson\nkeep it small" });
    // 观察：取真侧被走到 —— code 进入 details；record 侧没有 status 字段
    expect(degraded).toEqual({
      content: [{ type: "text", text: "memory unavailable: not_found" }],
      details: { error: "not_found" },
    });
    expect(degraded.details).not.toHaveProperty("status");
    // 步骤 3 / 4：取假侧 —— 不是 Mem0ApiError，原样上抛
    const plain = new Error("not a mem0 error");
    const plainFake = fakeMem0({ addError: plain });
    const plainTool = createMem0RecordTool({ mem0: plainFake.mem0, context: skillContext() });
    await expect(runExecute(plainTool, { content: "## Lesson\nkeep it small" })).rejects.toBe(plain);
  });
});
