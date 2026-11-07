/**
 * Case ID: UT-MATRIX-023  ·  STATUS: real
 *
 * 责任：分支 L103 ! : !joined.includes(room)（matrix.ts）
 * 维度坐标：`verifyDiscussion` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-023.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-023 · verifyDiscussion · 状态分支 × 合法迁移", () => {
  it("refuses when Piko is not in the room", async () => {
    // 步骤 1：构造 client 替身（已加入的房间列表不含目标房间）
    const store = newStore();
    try {
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!other:test"] }),
        fetchRoomEvent: async () => ({ room_id: "!room:test", content: { body: "hi" } }),
      });

      // 步骤 2：调用 verifyDiscussion
      // 步骤 3：断言被拒
      await expect(matrix.verifyDiscussion("!room:test", "$event")).rejects.toThrow(/not joined/);
    } finally {
      store.close();
    }
  });

});
