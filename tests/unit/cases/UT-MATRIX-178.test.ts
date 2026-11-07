/**
 * Case ID: UT-MATRIX-178  ·  STATUS: real
 *
 * 责任：分支 L86 if : if (!joined.has(room))（matrix.ts）
 * 维度坐标：`processBatch` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-178.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-178 · processBatch · 状态分支 × 合法迁移", () => {
  it("records the loss and drops the room when Piko is no longer a member", async () => {
    // 步骤 1：构造 store、有讨论上下文的 run 与 client 替身（房间列表不含它）
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!other:test"] }),
      });

      // 步骤 2：调用 processBatch —— 不得抛错（抛错会让 SDK 永久停掉客户端）
      await expect(
        (matrix as unknown as { processBatch(e: unknown[], c: string): Promise<void> }).processBatch(
          [event("$one")],
          "cursor-1",
        ),
      ).resolves.toBeUndefined();

      // 步骤 3：断言丢失被记下、该房间的事件未被 ingest
      expect(store.discussionAccessLost("t")).toBe(true);
      expect(store.hasMatrixEvent("!room:test", "$one")).toBe(false);
    } finally {
      store.close();
    }
  });

});
