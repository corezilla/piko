/**
 * Case ID: UT-MATRIX-028  ·  STATUS: real
 *
 * 责任：throw L104 discussion trigger is not in t（matrix.ts:101）
 * 维度坐标：`verifyDiscussion` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-028.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-028 · verifyDiscussion · 错误路径 × 每个 typed 错误码", () => {
  it("throws the declared wrong-room error", async () => {
    // 步骤 1：构造 client 替身（取回的事件在别的房间）
    const store = newStore();
    try {
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
        fetchRoomEvent: async () => ({ room_id: "!other:test", content: { body: "x" } }),
      });

      // 步骤 2：调用 verifyDiscussion
      // 步骤 3：断言错误消息逐值对账
      await expect(matrix.verifyDiscussion("!room:test", "$event")).rejects.toThrow(
        "discussion trigger is not in the requested room",
      );
    } finally {
      store.close();
    }
  });

});
