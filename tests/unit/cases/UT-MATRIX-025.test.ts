/**
 * Case ID: UT-MATRIX-025  ·  STATUS: real
 *
 * 责任：分支 L105 ?. : e.content?.body（matrix.ts）
 * 维度坐标：`verifyDiscussion` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-025.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-025 · verifyDiscussion · 状态分支 × 合法迁移", () => {
  it("returns an empty string when the body is not a string", async () => {
    // 步骤 1：构造 client 替身（事件没有 content）
    const store = newStore();
    try {
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
        fetchRoomEvent: async () => ({ room_id: "!room:test" }),
      });

      // 步骤 2：调用 verifyDiscussion
      // 步骤 3：断言返回空串（可选链取 undefined → 非字符串 → ""）
      await expect(matrix.verifyDiscussion("!room:test", "$event")).resolves.toBe("");
    } finally {
      store.close();
    }
  });

});
