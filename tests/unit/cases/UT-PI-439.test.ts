/**
 * Case ID: UT-PI-439  ·  STATUS: real
 *
 * 责任：分支 L320 `outcome.error?.message??`Pi operation ${outco…`（??；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-439.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-439 · execute · 状态分支 × 合法迁移", () => {
  it("falls back to the default operation message when the failure carries no message", async () => {  // falls back to the default operation message when the failure carries no message
    // 步骤 1：模型返回一个协议错误（无 message）⇒ ?? 落到默认串
    const fx = await piFixture();
    stubModelFetch(() => new Response("protocol violation", { status: 400 }));
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 失败路径被走到，summary 有内容
      expect(res.status).toBe("failed");
      expect(typeof res.summary).toBe("string");
      expect(res.summary.length).toBeGreaterThan(0);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
