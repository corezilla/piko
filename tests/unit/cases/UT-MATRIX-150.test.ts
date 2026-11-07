/**
 * Case ID: UT-MATRIX-150  ·  STATUS: real
 *
 * 责任：返回站点 L35 值 （matrix.ts）
 * 维度坐标：`prepareEvent` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-150.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-150 · prepareEvent · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns undefined for a redelivered event", async () => {
    // 步骤 1：构造 store、runtime，并先处理一次该事件
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, { getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }) });
      await (matrix as unknown as { processBatch(e: unknown[], c: string): Promise<void> }).processBatch(
        [event("$dup")],
        "cursor-1",
      );

      // 步骤 2：再次调用 prepareEvent(同一事件)
      const prepared = await (
        matrix as unknown as { prepareEvent(e: unknown): Promise<unknown> }
      ).prepareEvent(event("$dup"));

      // 步骤 3：断言返回 undefined
      expect(prepared).toBeUndefined();
    } finally {
      store.close();
    }
  });

});
