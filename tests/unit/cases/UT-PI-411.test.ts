/**
 * Case ID: UT-PI-411  ·  STATUS: real
 *
 * 责任：分支 L284 `? queuedTurn.turn_seq===1&&turnOperation===`$…`（ternary；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-411.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-411 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the first turn prompt ternary", async () => {  // takes the true side of the first turn prompt ternary
    // 步骤 1：turn_seq===1 且 operation 是 `${runId}:initial` ⇒ 走 initialPrompt(task, turn)
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
      // 步骤 3：断言 —— 取真侧：首回合的提示是 [指令, discussion 消息] 两条
      expect(res.status).toBe("completed");
      const body = stub.calls[0]?.body as { input?: unknown[] } | undefined;
      // 开发者提示 + 用户指令 + discussion 消息
      expect((body?.input ?? []).length).toBeGreaterThanOrEqual(3);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
