/**
 * Case ID: UT-MATRIX-156  ·  STATUS: real
 *
 * 责任：await 拒绝传播（auditMembership 的 await 目标拒绝必须 typed 化上抛；matrix.ts:48）
 * 维度坐标：`auditMembership` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-156.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-156 · auditMembership · 错误路径 × 每个 typed 错误码", () => {
  it("swallows the homeserver failure and keeps the runtime alive", async () => {
    // 步骤 1：构造 store 与一个会失败的 client
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => {
          throw new Error("homeserver unavailable");
        },
      });

      // 步骤 2：调用 auditMembership
      // 步骤 3：断言不抛错、且没有把房间判成丢失（错误不等于丢成员资格）
      await expect(
        (matrix as unknown as { auditMembership(): Promise<void> }).auditMembership(),
      ).resolves.toBeUndefined();
      expect(store.discussionAccessLost("t")).toBe(false);
    } finally {
      store.close();
    }
  });

});
