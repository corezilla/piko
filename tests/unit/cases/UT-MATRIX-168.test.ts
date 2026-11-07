/**
 * Case ID: UT-MATRIX-168  ·  STATUS: real
 *
 * 责任：参数 `events` 的 `边界(上/下/零/空/满)` 类（matrix.ts:79）
 * 维度坐标：`processBatch` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-168.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-168 · processBatch · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("accepts an empty batch", async () => {
    // 步骤 1：构造 store 与 runtime
    const store = newStore();
    try {
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
      });

      // 步骤 2：调用 processBatch(空批次, "cursor-0")
      await (matrix as unknown as { processBatch(e: unknown[], c: string): Promise<void> }).processBatch(
        [],
        "cursor-0",
      );

      // 步骤 3：断言无事发生、光标仍推进
      expect(store.matrixCursor()).toBe("cursor-0");
    } finally {
      store.close();
    }
  });

});
