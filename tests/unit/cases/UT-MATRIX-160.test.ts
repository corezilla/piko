/**
 * Case ID: UT-MATRIX-160  ·  STATUS: real
 *
 * 责任：分支 L67 catch : catch ()（matrix.ts）
 * 维度坐标：`isJoined` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-160.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-160 · isJoined · 状态分支 × 合法迁移", () => {
  it("answers yes on a transient homeserver error", async () => {
    // 步骤 1：构造 runtime 与一个会失败的 client
    const store = newStore();
    try {
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => {
          throw new Error("homeserver unavailable");
        },
      });

      // 步骤 2：调用 isJoined
      // 步骤 3：断言为 true——瞬时错误答「还在」，不误判丢失成员资格
      await expect(matrix.isJoined("!room:test")).resolves.toBe(true);
    } finally {
      store.close();
    }
  });

});
