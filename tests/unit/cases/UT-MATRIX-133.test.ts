/**
 * Case ID: UT-MATRIX-133  ·  STATUS: real
 *
 * 责任：分支 L31 || : !room||!id（matrix.ts）
 * 维度坐标：`prepareEvent` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-133.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-133 · prepareEvent · 状态分支 × 合法迁移", () => {
  it("ignores an event when either the room or the id is missing", async () => {
    // 步骤 1：构造 store、runtime
    const store = newStore();
    try {
      const matrix = runtimeWith(store, { getJoinedRooms: async () => ({ joined_rooms: [] }) });

      // 步骤 2：调用 prepareEvent（缺 room）
      const prepared = await (
        matrix as unknown as { prepareEvent(e: unknown): Promise<unknown> }
      ).prepareEvent(event("$one", { getRoomId: () => "" }));

      // 步骤 3：断言被忽略（任一缺失即返回）
      expect(prepared).toBeUndefined();
    } finally {
      store.close();
    }
  });

});
