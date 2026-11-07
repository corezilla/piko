/**
 * Case ID: UT-MATRIX-143  ·  STATUS: real
 *
 * 责任：分支 L36 loop : loop (this.store.openDiscussionRuns(room))（matrix.ts）
 * 维度坐标：`prepareEvent` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-143.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-143 · prepareEvent · 状态分支 × 合法迁移", () => {
  it("routes the event to every open run in the room", async () => {
    // 步骤 1：构造 store、两个同房间的 run 与 runtime
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      store.createOrGet(
        { ...task, task_id: "t2", discussion: { room_id: "!room:test", trigger_event_id: "$e2" } },
        "slinky",
        10,
        "trigger",
      );
      const matrix = runtimeWith(store, { getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }) });

      // 步骤 2：调用 prepareEvent(消息事件)
      const prepared = await (
        matrix as unknown as { prepareEvent(e: unknown): Promise<unknown> }
      ).prepareEvent(event("$one"));

      // 步骤 3：断言两个 run 都收到这条 turn
      expect((prepared as { turns: unknown[] }).turns).toHaveLength(2);
    } finally {
      store.close();
    }
  });

});
