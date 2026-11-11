/**
 * Case ID: UT-PI-355  ·  STATUS: real
 *
 * 责任：分支 L232 `if (active)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-355.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-355 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the active operation check when a model request is made", async () => {  // takes the true side of the active operation check when a model request is made
    // 步骤 1：正常跑一轮 ⇒ before_request 先把 active 置上
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— observeUsage 只在 active 已置上时才上报，
      // 因此这里能观察到一条 observeUsage 事实
      expect(res.status).toBe("completed");
      const usage = fx.facts.find((f) => f.kind === "observeUsage");
      expect(usage).toBeDefined();
      expect((usage as { raw: unknown }).raw).toEqual({
        input: 3,
        output: 5,
        totalTokens: 8,
      });
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
