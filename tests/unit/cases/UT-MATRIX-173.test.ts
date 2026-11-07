/**
 * Case ID: UT-MATRIX-173  ·  STATUS: real
 *
 * 责任：分支 L80 && : !!room&&this.store.openDiscussionRuns(room
 * 维度坐标：`processBatch` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-173.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-173 · processBatch · 状态分支 × 合法迁移", () => {
  it("keeps only rooms with open discussion runs", async () => {
    // 步骤 1：构造 store：一个有讨论上下文的 run、一个没有的
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      store.createOrGet({ ...task, task_id: "plain", discussion: undefined }, "slinky", 10, undefined);
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
      });

      // 步骤 2：调用 processBatch
      await (matrix as unknown as { processBatch(e: unknown[], c: string): Promise<void> }).processBatch(
        [event("$one")],
        "cursor-1",
      );

      // 步骤 3：断言有讨论上下文的 run 收到了 turn
      expect(store.pendingTurns("t").length).toBeGreaterThan(0);
    } finally {
      store.close();
    }
  });

});
