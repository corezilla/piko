/**
 * Case ID: UT-MATRIX-154  ·  STATUS: real
 *
 * 责任：分支 L52 ! : !joined.has(room)（matrix.ts）
 * 维度坐标：`auditMembership` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-154.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-154 · auditMembership · 状态分支 × 合法迁移", () => {
  it("does not record a loss while Piko is still in the room", async () => {
    // 步骤 1：构造 store、有讨论上下文的 run 与 client 替身（房间在列表里）
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
      });

      // 步骤 2：调用 auditMembership
      await (matrix as unknown as { auditMembership(): Promise<void> }).auditMembership();

      // 步骤 3：断言没有被判丢失
      expect(store.discussionAccessLost("t")).toBe(false);
    } finally {
      store.close();
    }
  });

});
