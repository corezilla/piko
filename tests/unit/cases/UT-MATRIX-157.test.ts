/**
 * Case ID: UT-MATRIX-157  ·  STATUS: real
 *
 * 责任：参数 `room: string` 的 `空` 类（matrix.ts:63）
 * 维度坐标：`isJoined` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-157.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-157 · isJoined · 字符串/路径/枚举输入 × 空", () => {
  it("answers false for an empty room", async () => {
    // 步骤 1：构造 runtime 与 client 替身（已加入的房间列表不含空串）
    const store = newStore();
    try {
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
      });

      // 步骤 2：调用 isJoined("")
      // 步骤 3：断言为 false
      await expect(matrix.isJoined("")).resolves.toBe(false);
    } finally {
      store.close();
    }
  });

});
