/**
 * Case ID: UT-PI-419  ·  STATUS: real
 *
 * 责任：分支 L290 `if (initialTurn)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-419.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-419 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the initial turn presence check", async () => {  // takes the true side of the initial turn presence check
    // 步骤 1：discussion 任务有 turn_seq===1 的初始回合
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
      // 步骤 3：断言 —— 取真侧：初始回合被上报并消费
      expect(res.status).toBe("completed");
      expect(fx.facts.some((f) => f.kind === "turn" && (f as { status: string }).status === "QueuedInPi")).toBe(true);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
