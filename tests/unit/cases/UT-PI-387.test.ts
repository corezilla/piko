/**
 * Case ID: UT-PI-387  ·  STATUS: real
 *
 * 责任：分支 L260 `catch (error)`（catch；pi-runtime.ts）
 * 维度坐标：`execute` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-387.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools, sseResponse, toolCallSse, textResponseSse } from "./support/pi-runtime-fix.js";

describe("UT-PI-387 · execute · 错误路径 × 每个 typed 错误码", () => {
  it("rejects a path that escapes the workspace with the typed ToolFailure", async () => {  // rejects a path that escapes the workspace with the typed ToolFailure
    // 步骤 1：模型请求读取工作区之外的路径 ⇒ authorizePath 抛 ScopeDenied
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
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 拒绝被保真传播为 ToolFailure（cause_class Tool）
      expect(res.status).toBe("failed");
      expect(res.failure?.code).toBe("ToolFailure");
      expect(res.failure?.cause_class).toBe("Tool");
      expect(res.failure?.message).toBe("path escapes workspace");
      expect(res.summary).toBe("path escapes workspace");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
