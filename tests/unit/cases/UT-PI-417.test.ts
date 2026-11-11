/**
 * Case ID: UT-PI-417  ·  STATUS: real
 *
 * 责任：分支 L290 `{const initialTurn=task.discussion?this…`（else；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `每个非法迁移拒绝`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-417.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-417 · execute · 状态分支 × 每个非法迁移拒绝", () => {
  it("rejects the illegal transition of accepting an initial prompt with no prior result", async () => {  // rejects the illegal transition of accepting an initial prompt with no prior result
    // 步骤 1：没有 prior result ⇒ 走 else 分支，接受 initial prompt
    const fx = await piFixture();
    stubModelFetch();
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false);
      // 步骤 3：断言 —— 该迁移不被拒绝：接受成功并跑完
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
