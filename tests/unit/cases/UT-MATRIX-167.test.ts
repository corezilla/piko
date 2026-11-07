/**
 * Case ID: UT-MATRIX-167  ·  STATUS: real
 *
 * 责任：参数 `events` 的 `每等价类合法值` 类（matrix.ts:79）
 * 维度坐标：`processBatch` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-167.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-167 · processBatch · 纯函数/无副作用 × 每等价类合法值", () => {
  it("ingests the events of a room Piko is in", async () => {
    // 步骤 1：构造 store、有讨论上下文的 run 与 client 替身
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
      });

      // 步骤 2：调用 processBatch(一条消息, "cursor-1")
      await (matrix as unknown as { processBatch(e: unknown[], c: string): Promise<void> }).processBatch(
        [event("$one")],
        "cursor-1",
      );

      // 步骤 3：断言事件被记下、光标推进
      expect(store.hasMatrixEvent("!room:test", "$one")).toBe(true);
      expect(store.matrixCursor()).toBe("cursor-1");
    } finally {
      store.close();
    }
  });

});
