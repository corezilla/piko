/**
 * Case ID: UT-MATRIX-183  ·  STATUS: real
 *
 * 责任：分支 L88 ! : !room（matrix.ts）
 * 维度坐标：`processBatch` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-183.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-183 · processBatch · 状态分支 × 合法迁移", () => {
  it("skips an event with an empty room id", async () => {
    // 步骤 1：构造 store、有讨论上下文的 run 与 runtime
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
      });

      // 步骤 2：调用 processBatch(空房间事件, "cursor-1")
      await (matrix as unknown as { processBatch(e: unknown[], c: string): Promise<void> }).processBatch(
        [event("$one", { getRoomId: () => "" })],
        "cursor-1",
      );

      // 步骤 3：断言这条事件没有被 ingest（已有的 turn 不受影响）
      expect(store.hasMatrixEvent("!room:test", "$one")).toBe(false);
    } finally {
      store.close();
    }
  });

});
