/**
 * Case ID: UT-PI-441  ·  STATUS: real
 *
 * 责任：分支 L321 `outcome.error?.code==="model_unavailable"||is…`（||；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-441.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-441 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the provider unavailability classification", async () => {  // takes the true side of the provider unavailability classification
    // 步骤 1：502 ⇒ isProviderUnavailableMessage 为真
    const fx = await piFixture();
    stubModelFetch(() => new Response("upstream (502) bad gateway", { status: 502 }));
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取真侧 ⇒ ModelUnavailable / Dependency
      expect(res.status).toBe("failed");
      expect(res.failure?.code).toBe("ModelUnavailable");
      expect(res.failure?.cause_class).toBe("Dependency");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
