/**
 * Case ID: UT-PI-438  ·  STATUS: real
 *
 * 责任：分支 L319 `if (outcome.status==="aborted")`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-438.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-438 · execute · 状态分支 × 合法迁移", () => {
  it("takes the false side of the aborted outcome check on a completed run", async () => {  // takes the false side of the aborted outcome check on a completed run
    // 步骤 1：驱动返回 completed（不是 aborted）⇒ if 取假
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 取假侧：不是 cancelled
      expect(res.status).toBe("completed");
      expect(res.failure?.code).not.toBe("CancelledByRequest");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
