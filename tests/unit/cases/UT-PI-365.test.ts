/**
 * Case ID: UT-PI-365  ·  STATUS: real
 *
 * 责任：分支 L249 `? latestUsage?.source==="injected" :`（ternary；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-365.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-365 · execute · 状态分支 × 合法迁移", () => {
  it("records an empty note when the usage was not injected", async () => {  // records an empty note when the usage was not injected
    // 步骤 1：正常跑一轮 ⇒ latestUsage.source 不是 "injected"
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— note 为空串
      expect(res.status).toBe("completed");
      const call = fx.facts.find((f) => f.kind === "providerCall");
      expect(call).toBeDefined();
      expect((call as { note: string }).note).toBe("");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
