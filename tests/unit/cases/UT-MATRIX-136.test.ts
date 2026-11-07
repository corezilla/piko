/**
 * Case ID: UT-MATRIX-136  ·  STATUS: real
 *
 * 责任：分支 L32 ?? : event.getSender()??""（matrix.ts）
 * 维度坐标：`prepareEvent` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-136.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-136 · prepareEvent · 状态分支 × 合法迁移", () => {
  it("treats a missing sender as an empty string", async () => {
    // 步骤 1：构造 store、runtime 与一个没有发送者的事件
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, { getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }) });

      // 步骤 2：调用 prepareEvent(无发送者)
      const prepared = await (
        matrix as unknown as { prepareEvent(e: unknown): Promise<unknown> }
      ).prepareEvent(event("$one", { getSender: () => undefined }));

      // 步骤 3：断言发送者为空串
      expect((prepared as { sender: string }).sender).toBe("");
    } finally {
      store.close();
    }
  });

});
