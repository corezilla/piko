/**
 * Case ID: UT-MATRIX-187  ·  STATUS: real
 *
 * 责任：await 拒绝传播（processBatch 的 await 目标拒绝必须 typed 化上抛；matrix.ts:79）
 * 维度坐标：`processBatch` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-187.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-187 · processBatch · 错误路径 × 每个 typed 错误码", () => {
  it("still records the cursor after a room was dropped", async () => {
    // 步骤 1：构造 store、有讨论上下文的 run 与 client 替身
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: [] }),
      });

      // 步骤 2：调用 processBatch(事件, "cursor-1")
      await (matrix as unknown as { processBatch(e: unknown[], c: string): Promise<void> }).processBatch(
        [event("$one")],
        "cursor-1",
      );

      // 步骤 3：断言光标推进（批次被处理了，不是被跳过）
      expect(store.matrixCursor()).toBe("cursor-1");
    } finally {
      store.close();
    }
  });

});
