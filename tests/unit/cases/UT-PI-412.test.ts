/**
 * Case ID: UT-PI-412  ·  STATUS: real
 *
 * 责任：分支 L284 `queuedTurn.turn_seq===1&&turnOperation===`${r…`（&&；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-412.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-412 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the conjunction that selects the initial prompt for a first turn", async () => {  // takes the true side of the conjunction that selects the initial prompt for a first turn
    // 步骤 1：首回合（turn_seq===1）且 operation 是 `${runId}:initial` ⇒ 两个条件同时成立
    const fx = await piFixture();
    const stub = stubModelFetch();
    try {
      fx.store.createOrGet(
        piTask("task-1", { discussion: { room_id: "!room:piko", trigger_event_id: "evt-1" } }),
        "slinky",
        10,
        "kick off",
      );
      // 步骤 2：调用 execute(…)
      const res = await fx.runtime.execute("task-1", 1, piTask("task-1", { discussion: { room_id: "!room:piko", trigger_event_id: "evt-1" } }), fx.root, () => false);
      // 步骤 3：断言 —— 取真侧跑完
      expect(res.status).toBe("completed");
      expect(stub.calls.length).toBeGreaterThan(0);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
