/**
 * Case ID: UT-PI-432  ·  STATUS: real
 *
 * 责任：分支 L303 `if (outcome.status==="completed")`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-432.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-432 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the completed outcome check and returns the completion result", async () => {  // takes the true side of the completed outcome check and returns the completion result
    // 步骤 1：驱动返回 completed
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取真侧：返回 completed 与最终文本
      expect(res.status).toBe("completed");
      expect(res.summary).toBe("done");
      expect(res.failure).toBeUndefined();
      expect(res.executions).toEqual([]);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
