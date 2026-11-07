/**
 * Case ID: UT-MATRIX-138  ·  STATUS: real
 *
 * 责任：分支 L33 if : if (sender===this.config.matrix.user_id)（matrix.ts）
 * 维度坐标：`prepareEvent` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-138.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-138 · prepareEvent · 状态分支 × 合法迁移", () => {
  it("records Piko's own message as a self echo", async () => {
    // 步骤 1：构造 store、runtime 与一条来自 Piko 自己的消息
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, { getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }) });

      // 步骤 2：调用 prepareEvent(自己的消息)
      const prepared = await (
        matrix as unknown as { prepareEvent(e: unknown): Promise<unknown> }
      ).prepareEvent(event("$self", { getSender: () => "@piko:test" }));

      // 步骤 3：断言 turn 为空（自己的回声不产生待办 turn）
      expect((prepared as { turns: unknown[] }).turns).toEqual([]);
    } finally {
      store.close();
    }
  });

});
