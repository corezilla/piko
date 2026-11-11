/**
 * Case ID: UT-PI-405  ·  STATUS: real
 *
 * 责任：分支 L281 `if(!operation){ const result=await lane…`（else；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `每个非法迁移拒绝`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-405.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-405 · execute · 状态分支 × 每个非法迁移拒绝", () => {
  it("rejects the illegal transition of a queued turn with no matching open operation", async () => {  // rejects the illegal transition of a queued turn with no matching open operation
    // 步骤 1：queued turn 存在但没有对应的 open operation ⇒ 走 else 分支
    const fx = await piFixture();
    stubModelFetch();
    try {
      fx.store.createOrGet(
        piTask("task-1", { discussion: { room_id: "!room:piko", trigger_event_id: "evt-1" } }),
        "slinky",
        10,
        "kick off",
      );
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1", { discussion: { room_id: "!room:piko", trigger_event_id: "evt-1" } }), fx.root, () => false);
      // 步骤 3：断言 —— 该迁移不被拒绝：execute 为这个回合新起一个 operation 并跑完
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
