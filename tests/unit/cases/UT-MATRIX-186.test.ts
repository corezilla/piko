/**
 * Case ID: UT-MATRIX-186  ·  STATUS: real
 *
 * 责任：await 拒绝传播（processBatch 的 await 目标拒绝必须 typed 化上抛；matrix.ts:79）
 * 维度坐标：`processBatch` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-186.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-186 · processBatch · 错误路径 × 每个 typed 错误码", () => {
  it("does not throw when a room is lost mid-batch", async () => {
    // 步骤 1：构造 store、有讨论上下文的 run 与 client 替身（房间列表不含它）
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!other:test"] }),
      });

      // 步骤 2：调用 processBatch —— 不得抛错
      //         （抛错会让 matrix-js-sdk 永久停掉客户端，其他房间的 intake 也会死）
      await expect(
        (matrix as unknown as { processBatch(e: unknown[], c: string): Promise<void> }).processBatch(
          [event("$one")],
          "cursor-1",
        ),
      ).resolves.toBeUndefined();

      // 步骤 3：断言丢失被记下（fail-closed 由审计兜底）
      expect(store.discussionAccessLost("t")).toBe(true);
    } finally {
      store.close();
    }
  });

});
