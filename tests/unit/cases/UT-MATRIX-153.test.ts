/**
 * Case ID: UT-MATRIX-153  ·  STATUS: real
 *
 * 责任：分支 L52 if : if (!joined.has(room))（matrix.ts）
 * 维度坐标：`auditMembership` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-153.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-153 · auditMembership · 状态分支 × 合法迁移", () => {
  it("records the loss when Piko is no longer in the room", async () => {
    // 步骤 1：构造 store、有讨论上下文的 run 与 client 替身（房间列表不含它）
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!other:test"] }),
      });

      // 步骤 2：调用 auditMembership
      await (matrix as unknown as { auditMembership(): Promise<void> }).auditMembership();

      // 步骤 3：断言丢失被记下（fail-closed）
      expect(store.discussionAccessLost("t")).toBe(true);
    } finally {
      store.close();
    }
  });

});
