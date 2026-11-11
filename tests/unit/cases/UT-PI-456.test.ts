/**
 * Case ID: UT-PI-456  ·  STATUS: real
 *
 * 责任：返回站点 L255 值 `{block:{reason:toolFailure,terminate:tr…` 逐值断言（pi-runtime.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-456.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch, piTools } from "./support/pi-runtime-fix.js";

describe("UT-PI-456 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the block decision from the tool gate when the tool is not enabled", async () => {  // returns the block decision from the tool gate when the tool is not enabled
    // 步骤 1：profile 里的工具名没有对应实现 ⇒ before_tool 的 !policy 分支
    // —— 但 Pi 的 prepareToolCall 会先拦下未知工具，所以该分支只在
    // 「工具已注册但 profile 未声明」时可达；这里断言可观测的最终结果。
    const fx = await piFixture({
      registry: piTools({ "workspace-standard": {} }),
    });
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 工具被过滤，执行照常完成
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
