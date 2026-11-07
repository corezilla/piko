/**
 * Case ID: UT-MATRIX-029  ·  STATUS: real
 *
 * 责任：返回站点 L105 值 （matrix.ts:101）
 * 维度坐标：`verifyDiscussion` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-029.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-029 · verifyDiscussion · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the verified body", async () => {
    // 步骤 1：构造 client 替身
    const store = newStore();
    try {
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
        fetchRoomEvent: async () => ({ room_id: "!room:test", content: { body: "verified" } }),
      });

      // 步骤 2：调用 verifyDiscussion
      const body = await matrix.verifyDiscussion("!room:test", "$event");

      // 步骤 3：断言返回值逐值对账
      expect(body).toBe("verified");
    } finally {
      store.close();
    }
  });

});
