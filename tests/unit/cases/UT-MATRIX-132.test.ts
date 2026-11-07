/**
 * Case ID: UT-MATRIX-132  ·  STATUS: real
 *
 * 责任：分支 L31 if : if (!room||!id)（matrix.ts）
 * 维度坐标：`prepareEvent` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-132.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-132 · prepareEvent · 状态分支 × 合法迁移", () => {
  it("ignores an event without a room or id", async () => {
    // 步骤 1：构造 store、runtime 与两个缺字段的事件
    const store = newStore();
    try {
      const matrix = runtimeWith(store, { getJoinedRooms: async () => ({ joined_rooms: [] }) });

      // 步骤 2：分别调用 prepareEvent
      const noRoom = await (
        matrix as unknown as { prepareEvent(e: unknown): Promise<unknown> }
      ).prepareEvent(event("$one", { getRoomId: () => undefined }));
      const noId = await (
        matrix as unknown as { prepareEvent(e: unknown): Promise<unknown> }
      ).prepareEvent(event("$one", { getId: () => undefined }));

      // 步骤 3：断言都被忽略
      expect(noRoom).toBeUndefined();
      expect(noId).toBeUndefined();
    } finally {
      store.close();
    }
  });

});
