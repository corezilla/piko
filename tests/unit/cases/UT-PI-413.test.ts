/**
 * Case ID: UT-PI-413  ·  STATUS: real
 *
 * 责任：分支 L284 `!accepted.ok`（!；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-413.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-413 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the acceptance check when the turn prompt is accepted", async () => {  // takes the true side of the acceptance check when the turn prompt is accepted
    // 步骤 1：正常的回合提示被 lane 接受
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
      // 步骤 3：断言 —— 取真侧：!accepted.ok 为假 ⇒ 不抛错，回合被消费
      expect(res.status).toBe("completed");
      expect(fx.facts.some((f) => f.kind === "turn" && (f as { status: string }).status === "Consumed")).toBe(true);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
