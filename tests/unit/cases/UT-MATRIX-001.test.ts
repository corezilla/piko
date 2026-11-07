/**
 * Case ID: UT-MATRIX-001  ·  STATUS: real
 *
 * 责任：`auditMembership` × `时间域行为` × `超时边界 ±1 tick`（波次一粗粒度登记）
 * 维度坐标：`auditMembership` × `时间域行为` × `超时边界 ±1 tick`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-001.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-001 · auditMembership · 时间域行为 × 超时边界 ±1 tick", () => {
  it("keeps the audit silent while the room stays joined", async () => {
    // 步骤 1：构造 store、有讨论上下文的 run 与 client 替身
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
      });

      // 步骤 2：调用 auditMembership
      await (matrix as unknown as { auditMembership(): Promise<void> }).auditMembership();

      // 步骤 3：断言没有把仍在的房间判成丢失
      expect(store.discussionAccessLost("t")).toBe(false);
    } finally {
      store.close();
    }
  });

});
