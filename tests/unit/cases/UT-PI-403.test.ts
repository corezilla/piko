/**
 * Case ID: UT-PI-403  ·  STATUS: real
 *
 * 责任：分支 L279 `queuedTurn.pi_operation_id??`${runId}:turn:${…`（??；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-403.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-403 · execute · 状态分支 × 合法迁移", () => {
  it("falls back to a derived turn operation id when the queued turn carries none", async () => {  // falls back to a derived turn operation id when the queued turn carries none
    // 步骤 1：discussion 任务，turn 没有 pi_operation_id ⇒ ?? 落到 `${runId}:turn:${seq}`
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
      // 步骤 3：断言 —— 取真侧跑完。
      // turn_seq=1 的首回合落在 initial operation 上（turn_seq===1 &&
      // turnOperation===`${runId}:initial` 两个条件同时成立），
      // 因此这里看到的 operation 是 initial 而不是派生的 turn id。
      expect(res.status).toBe("completed");
      const turn = fx.facts.find((f) => f.kind === "turn" && (f as { operation?: string }).operation);
      expect(turn).toBeDefined();
      expect((turn as { operation: string }).operation).toBe("task-1:initial");
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
