/**
 * Case ID: UT-MATRIX-152  ·  STATUS: real
 *
 * 责任：分支 L52 loop : loop (this.store.discussionRoomsInUse())（matrix.ts）
 * 维度坐标：`auditMembership` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-152.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-152 · auditMembership · 状态分支 × 合法迁移", () => {
  it("audits every room in use", async () => {
    // 步骤 1：构造 store、一个有讨论上下文的 run 与 client 替身
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
      });

      // 步骤 2：调用 auditMembership
      await (matrix as unknown as { auditMembership(): Promise<void> }).auditMembership();

      // 步骤 3：断言房间在仍加入时不被判丢失
      expect(store.discussionAccessLost("t")).toBe(false);
    } finally {
      store.close();
    }
  });

});
