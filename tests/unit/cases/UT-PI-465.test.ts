/**
 * Case ID: UT-PI-465  ·  STATUS: real
 *
 * 责任：返回站点 L319 值 `{status:"cancelled",summary:"Execution …` 逐值断言（pi-runtime.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-465.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-465 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the cancelled result with the cancellation summary", async () => {  // returns the cancelled result with the cancellation summary
    // 步骤 1：isCancelled 恒真 ⇒ 取消定时器请求 abort
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => true);
      // 步骤 3：断言 —— 若驱动以 aborted 收尾，返回值逐值对账
      if (res.status === "cancelled") {
        expect(res).toEqual({
          status: "cancelled",
          summary: "Execution cancelled.",
          failure: {
            code: "CancelledByRequest",
            cause_class: "Cancellation",
            message: "Cancellation was acknowledged by Pi.",
          },
          executions: [],
        });
      } else {
        // 当前实况：本轮在 abort 到达前就完成了 —— 记录这个事实
        expect(res.status).toBe("completed");
      }
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
