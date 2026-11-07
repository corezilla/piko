/**
 * Case ID: UT-MATRIX-170  ·  STATUS: real
 *
 * 责任：参数 `cursor` 的 `空` 类（matrix.ts:79）
 * 维度坐标：`processBatch` × `纯函数/无副作用` × `空`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-170.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-170 · processBatch · 纯函数/无副作用 × 空", () => {
  it("accepts an empty cursor", async () => {
    // 步骤 1：构造 store 与 runtime
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
      });

      // 步骤 2：调用 processBatch(事件, "")
      await (matrix as unknown as { processBatch(e: unknown[], c: string): Promise<void> }).processBatch(
        [event("$one")],
        "",
      );

      // 步骤 3：断言光标被记为空串（该参数无校验）
      expect(store.matrixCursor()).toBe("");
    } finally {
      store.close();
    }
  });

});
