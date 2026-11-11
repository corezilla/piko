/**
 * Case ID: UT-PI-357  ·  STATUS: real
 *
 * 责任：分支 L241 `if (!providerDebug)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-357.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-357 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the provider debug guard and writes no debug file when debug is off", async () => {  // takes the true side of the provider debug guard and writes no debug file when debug is off
    // 步骤 1：PIKO_PROVIDER_DEBUG 不为 "1" ⇒ 调试关闭
    const previous = process.env.PIKO_PROVIDER_DEBUG;
    delete process.env.PIKO_PROVIDER_DEBUG;
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 调试关闭时提前返回，不产生任何调试副作用
      expect(res.status).toBe("completed");
      expect(fx.facts.some((f) => f.kind === "providerCall")).toBe(true);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
      if (previous === undefined) delete process.env.PIKO_PROVIDER_DEBUG;
      else process.env.PIKO_PROVIDER_DEBUG = previous;
    }
  });
});
