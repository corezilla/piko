/**
 * Case ID: UT-PI-452  ·  STATUS: real
 *
 * 责任：返回站点 L237 值 `{streamOptions:{maxRetries:0,headers:{"…` 逐值断言（pi-runtime.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-452.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-452 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the stream options and correlation header from the before request hook", async () => {  // returns the stream options and correlation header from the before request hook
    // 步骤 1：跑一轮 ⇒ before_request 返回 streamOptions 与头
    const fx = await piFixture();
    const stub = stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 模型请求带上 X-Correlation-ID 与 maxRetries:0
      expect(res.status).toBe("completed");
      const call = stub.calls[0];
      expect(call).toBeDefined();
      expect(call!.headers?.["x-correlation-id"]).toBe("task-1");
      expect(call!.headers?.["x-stainless-retry-count"]).toBe("0");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
