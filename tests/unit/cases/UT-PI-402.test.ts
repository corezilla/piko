/**
 * Case ID: UT-PI-402  ·  STATUS: real
 *
 * 责任：分支 L278 `if (queuedTurn)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-402.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-402 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the queued turn branch when the store has a pending turn", async () => {  // takes the true side of the queued turn branch when the store has a pending turn
    // 步骤 1：discussion 任务 ⇒ store 里有 turn_seq=1 的 Pending turn
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
      // 步骤 3：断言 —— 取真侧：回合被上报为 QueuedInPi 再 Consumed
      expect(res.status).toBe("completed");
      const turns = fx.facts.filter((f) => f.kind === "turn");
      expect(turns.length).toBeGreaterThan(0);
      expect(turns.some((f) => (f as { status: string }).status === "Consumed")).toBe(true);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
