/**
 * Case ID: UT-PI-423  ·  STATUS: real
 *
 * 责任：分支 L296 `if (!outcome)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-423.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-423 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the outcome presence check on a fresh drive", async () => {  // takes the true side of the outcome presence check on a fresh drive
    // 步骤 1：全新 operation ⇒ recoveredOutcome 为空 ⇒ !outcome 为真 ⇒ 走 drive
    const fx = await piFixture();
    const stub = stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取真侧：真的驱动了一次模型请求
      expect(res.status).toBe("completed");
      expect(stub.calls.length).toBeGreaterThan(0);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
