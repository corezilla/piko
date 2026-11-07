/**
 * Case ID: UT-MATRIX-003  ·  STATUS: real
 *
 * 责任：`isJoined` × `错误路径` × `每个 typed 错误码`（波次一粗粒度登记）
 * 维度坐标：`isJoined` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-003.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-003 · isJoined · 错误路径 × 每个 typed 错误码", () => {
  it("answers yes when the homeserver call fails", async () => {
    // 步骤 1：构造 runtime 与一个会失败的 client
    const store = newStore();
    try {
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => {
          throw new Error("homeserver unavailable");
        },
      });

      // 步骤 2：调用 isJoined
      // 步骤 3：断言答 true 且不抛错（瞬时错误答「还在」）
      await expect(matrix.isJoined("!room:test")).resolves.toBe(true);
    } finally {
      store.close();
    }
  });

});
