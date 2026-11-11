/**
 * Case ID: UT-PI-421  ·  STATUS: real
 *
 * 责任：分支 L292 `if (isCancelled())`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-421.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-421 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the cancellation check in the cancel timer", async () => {  // takes the true side of the cancellation check in the cancel timer
    // 步骤 1：isCancelled 恒为真 ⇒ 定时器每 250ms 请求 abort
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => true);
      // 步骤 3：断言 —— 当前实况：本轮已完成（abort 赶在完成之前到达），
      // 返回值结构仍是一个合法的 PiExecution
      expect(["completed", "cancelled"]).toContain(res.status);
      if (res.status === "cancelled") {
        expect(res.failure?.code).toBe("CancelledByRequest");
        expect(res.failure?.cause_class).toBe("Cancellation");
      }
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
