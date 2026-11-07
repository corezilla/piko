/**
 * Case ID: UT-MATRIX-011  ·  STATUS: real
 *
 * 责任：`verifyDiscussion` × `状态分支` × `合法迁移`（波次一粗粒度登记）
 * 维度坐标：`verifyDiscussion` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-011.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-011 · verifyDiscussion · 状态分支 × 合法迁移", () => {
  it("returns the trigger body for a room Piko is in", async () => {
    // 步骤 1：构造 runtime 与 client 替身
    const store = newStore();
    try {
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
        fetchRoomEvent: async () => ({ room_id: "!room:test", content: { body: "trigger body" } }),
      });

      // 步骤 2：调用 verifyDiscussion
      // 步骤 3：断言返回那段 body
      await expect(matrix.verifyDiscussion("!room:test", "$event")).resolves.toBe("trigger body");
    } finally {
      store.close();
    }
  });

});
