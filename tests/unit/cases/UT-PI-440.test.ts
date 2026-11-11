/**
 * Case ID: UT-PI-440  ·  STATUS: real
 *
 * 责任：分支 L320 `outcome.error?.message`（?.；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-440.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-440 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the optional chaining on the failure message", async () => {  // takes the true side of the optional chaining on the failure message
    // 步骤 1：模型返回一个带消息的失败
    const fx = await piFixture();
    stubModelFetch(() => new Response("upstream (503) service unavailable", { status: 503 }));
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取真侧：消息原样进入 summary 与 failure.message
      expect(res.status).toBe("failed");
      expect(res.failure?.message).toBe(res.summary);
      expect(res.summary).toMatch(/503/);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
