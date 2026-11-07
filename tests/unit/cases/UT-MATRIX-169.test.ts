/**
 * Case ID: UT-MATRIX-169  ·  STATUS: real
 *
 * 责任：参数 `events` 的 `非法值` 类（matrix.ts:79）
 * 维度坐标：`processBatch` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-169.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-169 · processBatch · 纯函数/无副作用 × 非法值", () => {
  it("ignores an event that is not a message", async () => {
    // 步骤 1：构造 store、runtime 与一个非消息事件
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
      });

      // 步骤 2：调用 processBatch(非消息事件, "cursor-1")
      await (matrix as unknown as { processBatch(e: unknown[], c: string): Promise<void> }).processBatch(
        [event("$one", { getType: () => "m.room.member" })],
        "cursor-1",
      );

      // 步骤 3：断言没有被当作消息记下
      expect(store.hasMatrixEvent("!room:test", "$one")).toBe(false);
    } finally {
      store.close();
    }
  });

});
