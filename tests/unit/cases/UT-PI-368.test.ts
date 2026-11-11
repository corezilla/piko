/**
 * Case ID: UT-PI-368  ·  STATUS: real
 *
 * 责任：分支 L249 `ev.status??null`（??；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-368.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-368 · execute · 状态分支 × 合法迁移", () => {
  it("falls back to a null status when the response carries no status", async () => {  // falls back to a null status when the response carries no status
    // 步骤 1：响应事件不带 status ⇒ ev.status ?? null 落到 null
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— providerCall 的 status 取到响应状态 200
      // （ev.status ?? null 的回落只在事件不带 status 时才落到 null）
      expect(res.status).toBe("completed");
      const call = fx.facts.find((f) => f.kind === "providerCall");
      expect(call).toBeDefined();
      expect((call as { status: unknown }).status).toBe(200);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
