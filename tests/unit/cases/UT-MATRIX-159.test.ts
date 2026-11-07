/**
 * Case ID: UT-MATRIX-159  ·  STATUS: real
 *
 * 责任：参数 `room` 的 `注入字符` 类（matrix.ts:63）
 * 维度坐标：`isJoined` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-159.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-159 · isJoined · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected room as data", async () => {
    // 步骤 1：构造 runtime 与 client 替身
    const store = newStore();
    try {
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
      });

      // 步骤 2：调用 isJoined(注入串)
      // 步骤 3：断言按普通房间名比对（不执行）
      await expect(matrix.isJoined("$(rm -rf /)")).resolves.toBe(false);
    } finally {
      store.close();
    }
  });

});
