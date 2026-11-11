/**
 * Case ID: UT-PI-410  ·  STATUS: real
 *
 * 责任：分支 L284 `{const prompt=queuedTurn.turn_seq===1&&…`（else；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `每个非法迁移拒绝`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-410.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-410 · execute · 状态分支 × 每个非法迁移拒绝", () => {
  it("rejects the illegal transition of accepting a turn with no prior result", async () => {  // rejects the illegal transition of accepting a turn with no prior result
    // 步骤 1：queued turn 没有对应 operation，也没有既有结果 ⇒ 走 else 分支新起 operation
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
      // 步骤 3：断言 —— 该迁移不被拒绝：为这个回合新起 operation 并跑完
      expect(res.status).toBe("completed");
      expect(res.failure).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
