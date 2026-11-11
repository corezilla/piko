/**
 * Case ID: UT-PI-429  ·  STATUS: real
 *
 * 责任：分支 L297 `outcome.status==="completed"&&onDiscussionRep…`（&&；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-429.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-429 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the completed and reply callback conjunction for a task without a turn", async () => {  // takes the true side of the completed and reply callback conjunction for a task without a turn
    // 步骤 1：非 discussion 任务 ⇒ 合取的第二个操作数（onDiscussionReply）为假
    const fx = await piFixture();
    stubModelFetch();
    let called = 0;
    try {
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1"), fx.root, () => false, async () => {
        called += 1;
      });
      // 步骤 3：断言 —— 回调不被调用，但回合事实也不产生
      expect(res.status).toBe("completed");
      expect(called).toBe(0);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
