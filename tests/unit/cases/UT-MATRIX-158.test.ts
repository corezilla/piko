/**
 * Case ID: UT-MATRIX-158  ·  STATUS: real
 *
 * 责任：参数 `room` 的 `超长` 类（matrix.ts:63）
 * 维度坐标：`isJoined` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-158.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-158 · isJoined · 字符串/路径/枚举输入 × 超长", () => {
  it("answers false for an over-long room", async () => {
    // 步骤 1：构造 runtime 与 client 替身
    const store = newStore();
    try {
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
      });

      // 步骤 2：调用 isJoined(超长房间)
      await expect(matrix.isJoined("!r".repeat(1000))).resolves.toBe(false);
    } finally {
      store.close();
    }
  });

});
