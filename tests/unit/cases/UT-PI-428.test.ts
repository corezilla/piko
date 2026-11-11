/**
 * Case ID: UT-PI-428  ·  STATUS: real
 *
 * 责任：分支 L297 `if (outcome.status==="completed"&&onDiscussio…`（if；pi-runtime.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-428.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { piFixture, piTask, stubModelFetch } from "./support/pi-runtime-fix.js";

describe("UT-PI-428 · execute · 状态分支 × 合法迁移", () => {
  it("takes the true side of the completed and reply callback conjunction for a discussion turn", async () => {  // takes the true side of the completed and reply callback conjunction for a discussion turn
    // 步骤 1：discussion 任务，有回合，且本轮完成
    const fx = await piFixture();
    stubModelFetch();
    const replies: string[] = [];
    try {
      fx.store.createOrGet(
        piTask("task-1", { discussion: { room_id: "!room:piko", trigger_event_id: "evt-1" } }),
        "slinky",
        10,
        "kick off",
      );
      // 步骤 2：调用 execute(…)，带 discussion 回复回调
      const res = await fx.runtime.execute(
        "task-1",
        1,
        piTask("task-1", { discussion: { room_id: "!room:piko", trigger_event_id: "evt-1" } }),
        fx.root,
        () => false,
        async (event, turn, body) => {
          replies.push(`${event}|${turn}|${body}`);
        },
      );
      // 步骤 3：断言 —— 取真侧：回调被调用一次，body 是助手最终文本
      expect(res.status).toBe("completed");
      expect(replies.length).toBe(1);
      expect(replies[0]).toContain("evt-1");
      expect(replies[0].endsWith("|done")).toBe(true);
    } finally {
      vi.unstubAllGlobals();
      await fx.close();
    }
  });
});
