/**
 * Case ID: UT-PI-363  ·  STATUS: real
 *
 * 责任：分支 L247 `ev.headers?.["x-request-id"]??ev.headers?.["X…`（??；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-363.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, sseResponse, textResponseSse } from "./support/pi-runtime-fix.js";

describe("UT-PI-363 · execute · 状态分支 × 合法迁移", () => {
  it("falls back to a null request id when the response carries no request id header", async () => {  // falls back to a null request id when the response carries no request id header
    // 步骤 1：响应不带 x-request-id 头 ⇒ ev.headers?.[…] ?? null 落到 null
    const fx = await piFixture();
    stubModelFetch(() => sseResponse(textResponseSse("done")));
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— providerCall 事实里 request_id 为 null
      expect(res.status).toBe("completed");
      const call = fx.facts.find((f) => f.kind === "providerCall");
      expect(call).toBeDefined();
      expect((call as { request_id: unknown }).request_id).toBeNull();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
