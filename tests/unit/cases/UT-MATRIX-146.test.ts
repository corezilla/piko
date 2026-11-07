/**
 * Case ID: UT-MATRIX-146  ·  STATUS: real
 *
 * 责任：返回站点 L30 值 （matrix.ts）
 * 维度坐标：`prepareEvent` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-146.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-146 · prepareEvent · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns undefined for a non-message event", async () => {
    // 步骤 1：构造 store、runtime 与一个非消息事件
    const store = newStore();
    try {
      const matrix = runtimeWith(store, { getJoinedRooms: async () => ({ joined_rooms: [] }) });

      // 步骤 2：调用 prepareEvent(非消息事件)
      const prepared = await (
        matrix as unknown as { prepareEvent(e: unknown): Promise<unknown> }
      ).prepareEvent(event("$one", { getType: () => "m.room.member" }));

      // 步骤 3：断言返回 undefined
      expect(prepared).toBeUndefined();
    } finally {
      store.close();
    }
  });

});
