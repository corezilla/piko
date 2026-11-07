/**
 * Case ID: UT-MATRIX-018  ·  STATUS: real
 *
 * 责任：参数 `event: string` 的 `超长` 类（matrix.ts:101）
 * 维度坐标：`verifyDiscussion` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-018.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-018 · verifyDiscussion · 字符串/路径/枚举输入 × 超长", () => {
  it("rejects an over-long event id", async () => {
    // 步骤 1：构造 runtime 与 client 替身
    const store = newStore();
    try {
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
        fetchRoomEvent: async () => ({ room_id: "!other:test", content: { body: "hi" } }),
      });

      // 步骤 2：调用 verifyDiscussion("!room:test", 超长事件 id)
      // 步骤 3：断言被拒
      await expect(matrix.verifyDiscussion("!room:test", "$".repeat(1000))).rejects.toThrow(/not in the requested room/);
    } finally {
      store.close();
    }
  });

});
