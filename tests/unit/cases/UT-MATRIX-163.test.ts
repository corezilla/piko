/**
 * Case ID: UT-MATRIX-163  ·  STATUS: real
 *
 * 责任：返回站点 L68 值 （matrix.ts:63）
 * 维度坐标：`isJoined` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-163.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-163 · isJoined · 纯函数/无副作用 × 每等价类合法值", () => {
  it("answers true on the catch side (transient errors keep trying)", async () => {
    // 步骤 1：构造 runtime 与一个会失败的 client
    const store = newStore();
    try {
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => {
          throw new Error("temporary");
        },
      });

      // 步骤 2：调用 isJoined
      // 步骤 3：断言 catch 分支返回 true
      await expect(matrix.isJoined("!room:test")).resolves.toBe(true);
    } finally {
      store.close();
    }
  });

});
