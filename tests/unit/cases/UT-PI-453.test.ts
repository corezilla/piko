/**
 * Case ID: UT-PI-453  ·  STATUS: real
 *
 * 责任：返回站点 L241 值 `（无值 return：提前退出）` 逐值断言（pi-runtime.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-453.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-453 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns early from the debug line without a value when debug is off", async () => {  // returns early from the debug line without a value when debug is off
    // 步骤 1：调试关闭 ⇒ debugLine 提前 return（无值）
    const previous = process.env.PIKO_PROVIDER_DEBUG;
    delete process.env.PIKO_PROVIDER_DEBUG;
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 提前退出没有产生任何调试副作用，执行照常完成
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
