/**
 * Case ID: UT-PI-420  ·  STATUS: real
 *
 * 责任：分支 L290 `!accepted.ok`（!；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-420.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-420 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the acceptance check when the initial prompt is accepted", async () => {  // takes the true side of the acceptance check when the initial prompt is accepted
    // 步骤 1：初始提示被 lane 接受
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取真侧：!accepted.ok 为假 ⇒ 不抛错，跑完
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
