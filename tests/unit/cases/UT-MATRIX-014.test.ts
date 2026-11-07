/**
 * Case ID: UT-MATRIX-014  ·  STATUS: real
 *
 * 责任：参数 `room: string` 的 `空` 类（matrix.ts:101）
 * 维度坐标：`verifyDiscussion` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-014.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { config, newStore, runtimeWith } from "./support/matrix-fix.js";

describe("UT-MATRIX-014 · verifyDiscussion · 字符串/路径/枚举输入 × 空", () => {
  it("rejects an empty room", async () => {
    // 步骤 1：构造 runtime 与 client 替身
    const store = newStore();
    try {
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
        fetchRoomEvent: async () => ({ room_id: "!room:test", content: { body: "hi" } }),
      });

      // 步骤 2：调用 verifyDiscussion("", "$event")
      // 步骤 3：断言被拒（空房间不在已加入的房间列表里）
      await expect(matrix.verifyDiscussion("", "$event")).rejects.toThrow(/not joined/);
    } finally {
      store.close();
    }
  });
});
