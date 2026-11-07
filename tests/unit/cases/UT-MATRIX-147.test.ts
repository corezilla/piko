/**
 * Case ID: UT-MATRIX-147  ·  STATUS: real
 *
 * 责任：返回站点 L31 值 （matrix.ts）
 * 维度坐标：`prepareEvent` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-147.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-147 · prepareEvent · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns undefined when the room or id is missing", async () => {
    // 步骤 1：构造 store、runtime
    const store = newStore();
    try {
      const matrix = runtimeWith(store, { getJoinedRooms: async () => ({ joined_rooms: [] }) });

      // 步骤 2：调用 prepareEvent(缺房间)
      const prepared = await (
        matrix as unknown as { prepareEvent(e: unknown): Promise<unknown> }
      ).prepareEvent(event("$one", { getRoomId: () => undefined }));

      // 步骤 3：断言返回 undefined
      expect(prepared).toBeUndefined();
    } finally {
      store.close();
    }
  });

});
