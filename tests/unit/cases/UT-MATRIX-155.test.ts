/**
 * Case ID: UT-MATRIX-155  ·  STATUS: real
 *
 * 责任：分支 L57 catch : catch ()（matrix.ts）
 * 维度坐标：`auditMembership` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-155.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-155 · auditMembership · 状态分支 × 合法迁移", () => {
  it("does not crash the runtime on a transient homeserver error", async () => {
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
      // 步骤 3：断言不抛错（瞬时错误不得让运行时崩溃）
      await expect(
        (matrix as unknown as { auditMembership(): Promise<void> }).auditMembership(),
      ).resolves.toBeUndefined();
    } finally {
      store.close();
    }
  });

});
