/**
 * Case ID: UT-PI-464  ·  STATUS: real
 *
 * 责任：返回站点 L317 值 `{status:"completed",summary:await final…` 逐值断言（pi-runtime.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-464.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-464 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the completed result with the final assistant text", async () => {  // returns the completed result with the final assistant text
    // 步骤 1：正常跑一轮 ⇒ 走 L317 的 completed 返回站点
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 返回值逐值对账
      expect(res).toEqual({
        status: "completed",
        summary: "done",
        executions: [],
      });
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
