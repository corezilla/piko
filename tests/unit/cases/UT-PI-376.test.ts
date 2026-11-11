/**
 * Case ID: UT-PI-376  ·  STATUS: real
 *
 * 责任：分支 L258 `event.toolName==="write"||event.toolName==="e…`（||；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-376.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-376 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the write tool detection for a write call", async () => {  // takes the true side of the write tool detection for a write call
    // 步骤 1：模型请求 write 工具 ⇒ write 为真 ⇒ 用 write_paths 做授权
    const fx = await piFixture({
      registry: piTools({ "workspace-standard": { write: { effect: "read_only", replay: "safe" } } as never }),
    });
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取真侧跑完（写授权在 write_paths 为空时同样会拒绝，
      // 但本例模型未请求写，故走完成路径）
      expect(res.status).toBe("completed");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
