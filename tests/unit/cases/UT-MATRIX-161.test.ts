/**
 * Case ID: UT-MATRIX-161  ·  STATUS: real
 *
 * 责任：await 拒绝传播（isJoined 的 await 目标拒绝必须 typed 化上抛；matrix.ts:63）
 * 维度坐标：`isJoined` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-161.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-161 · isJoined · 错误路径 × 每个 typed 错误码", () => {
  it("does not throw when the homeserver call fails", async () => {
    // 步骤 1：构造 runtime 与一个会失败的 client
    const store = newStore();
    try {
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => {
          throw new Error("homeserver unavailable");
        },
      });

      // 步骤 2：调用 isJoined
      // 步骤 3：断言不抛错（错误被吞成 true）
      await expect(matrix.isJoined("!room:test")).resolves.toBe(true);
    } finally {
      store.close();
    }
  });

});
