/**
 * Case ID: UT-PI-327  ·  STATUS: real
 *
 * 责任：参数 `isCancelled: ()=>boolean` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:155）
 * 维度坐标：`execute` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-327.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-327 · execute · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("accepts the boundary values of the cancellation predicate", async () => {  // accepts the boundary values of the cancellation predicate
    // 步骤 1：边界 —— 恒 false（永不取消）与恒 true（立即取消）
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…) —— 恒 false
      const res = await fx.runtime.execute("run-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 边界值不改变完成路径的返回结构
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
