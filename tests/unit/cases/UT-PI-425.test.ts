/**
 * Case ID: UT-PI-425  ·  STATUS: real
 *
 * 责任：分支 L296 `!driven.ok`（!；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-425.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-425 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the drive success check when the lane drive succeeds", async () => {  // takes the true side of the drive success check when the lane drive succeeds
    // 步骤 1：正常驱动 ⇒ driven.ok 为真
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取真侧：驱动成功并跑完
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
