/**
 * Case ID: UT-MATRIX-017  ·  STATUS: real
 *
 * 责任：参数 `event: string` 的 `空` 类（matrix.ts:101）
 * 维度坐标：`verifyDiscussion` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-017.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-017 · verifyDiscussion · 字符串/路径/枚举输入 × 空", () => {
  it("rejects an empty event id", async () => {
    // 步骤 1：构造 runtime 与 client 替身（取回的事件在别的房间）
    const store = newStore();
    try {
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
        fetchRoomEvent: async () => ({ room_id: "!other:test", content: { body: "hi" } }),
      });

      // 步骤 2：调用 verifyDiscussion("!room:test", "")
      // 步骤 3：断言被拒（取回的事件不在请求的房间）
      await expect(matrix.verifyDiscussion("!room:test", "")).rejects.toThrow(/not in the requested room/);
    } finally {
      store.close();
    }
  });

});
