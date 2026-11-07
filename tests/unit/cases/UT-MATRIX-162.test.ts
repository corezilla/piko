/**
 * Case ID: UT-MATRIX-162  ·  STATUS: real
 *
 * 责任：返回站点 L66 值 （matrix.ts:63）
 * 维度坐标：`isJoined` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-162.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-162 · isJoined · 纯函数/无副作用 × 每等价类合法值", () => {
  it("answers true for a joined room", async () => {
    // 步骤 1：构造 runtime 与 client 替身（房间在已加入列表里）
    const store = newStore();
    try {
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test", "!other:test"] }),
      });

      // 步骤 2：调用 isJoined("!room:test")
      // 步骤 3：断言为 true
      await expect(matrix.isJoined("!room:test")).resolves.toBe(true);
    } finally {
      store.close();
    }
  });

});
