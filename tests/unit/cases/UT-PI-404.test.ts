/**
 * Case ID: UT-PI-404  ·  STATUS: real
 *
 * 责任：分支 L280 `if (operation?.operationId===turnOperation)`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-404.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-404 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the operation match check when the queued turn matches the open operation", async () => {  // takes the true side of the operation match check when the queued turn matches the open operation
    // 步骤 1：discussion 任务；本轮 open 的 operation 与 turn 的 operation 一致
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
      // 步骤 3：断言 —— 取真侧跑完，回合被消费
      expect(res.status).toBe("completed");
      expect(fx.facts.some((f) => f.kind === "turn" && (f as { status: string }).status === "Consumed")).toBe(true);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
