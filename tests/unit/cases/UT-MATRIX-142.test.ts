/**
 * Case ID: UT-MATRIX-142  ·  STATUS: real
 *
 * 责任：分支 L35 if : if (this.store.hasMatrixEvent(room,id))（matrix.ts）
 * 维度坐标：`prepareEvent` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-142.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-142 · prepareEvent · 状态分支 × 合法迁移", () => {
  it("ignores a redelivered event", async () => {
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

      // 步骤 3：断言被忽略（去重——不产生第二个 turn）
      expect(prepared).toBeUndefined();
    } finally {
      store.close();
    }
  });

});
