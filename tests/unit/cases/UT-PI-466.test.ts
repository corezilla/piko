/**
 * Case ID: UT-PI-466  ·  STATUS: real
 *
 * 责任：返回站点 L322 值 `{status:"failed",summary:message,failur…` 逐值断言（pi-runtime.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-466.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-466 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the failed result with the model failure message", async () => {  // returns the failed result with the model failure message
    // 步骤 1：模型返回协议错误 ⇒ 走 L322 的 failed 返回站点
    const fx = await piFixture();
    stubModelFetch(() => new Response("bad request payload", { status: 400 }));
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 返回值逐值对账
      expect(res.status).toBe("failed");
      expect(res.failure?.code).toBe("ModelResponseInvalid");
      expect(res.failure?.cause_class).toBe("ModelProtocol");
      expect(res.summary).toBe(res.failure?.message);
      expect(res.executions).toEqual([]);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
