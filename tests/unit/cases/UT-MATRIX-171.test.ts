/**
 * Case ID: UT-MATRIX-171  ·  STATUS: real
 *
 * 责任：参数 `cursor` 的 `超长` 类（matrix.ts:79）
 * 维度坐标：`processBatch` × `纯函数/无副作用` × `超长`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-171.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-171 · processBatch · 纯函数/无副作用 × 超长", () => {
  it("accepts an over-long cursor", async () => {
    // 步骤 1：构造 store 与 runtime
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
      });

      // 步骤 2：调用 processBatch(事件, 超长光标)
      const cursor = "c".repeat(1000);
      await (matrix as unknown as { processBatch(e: unknown[], c: string): Promise<void> }).processBatch(
        [event("$one")],
        cursor,
      );

      // 步骤 3：断言光标原样记下
      expect(store.matrixCursor()).toBe(cursor);
    } finally {
      store.close();
    }
  });

});
