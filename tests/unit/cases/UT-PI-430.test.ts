/**
 * Case ID: UT-PI-430  ·  STATUS: real
 *
 * 责任：分支 L301 `if (toolFailure)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-430.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools, sseResponse, toolCallSse, textResponseSse } from "./support/pi-runtime-fix.js";

describe("UT-PI-430 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the tool failure check and returns the typed ToolFailure", async () => {  // takes the true side of the tool failure check and returns the typed ToolFailure
    // 步骤 1：路径授权被拒 ⇒ toolFailure 被置上
    const fx = await piFixture({
      registry: piTools({ "workspace-standard": { read: { effect: "read_only", replay: "safe" } } as never }),
    });
    let n = 0;
    stubModelFetch(() => {
      n += 1;
      return n === 1
        ? sseResponse(toolCallSse("read", { path: "../escape.txt" }))
        : sseResponse(textResponseSse("fallback text"));
    });
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取真侧：返回 ToolFailure 而不是完成
      expect(res.status).toBe("failed");
      expect(res.failure?.code).toBe("ToolFailure");
      expect(res.failure?.cause_class).toBe("Tool");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
