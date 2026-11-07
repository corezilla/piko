/**
 * Case ID: UT-MATRIX-184  ·  STATUS: real
 *
 * 责任：分支 L88 ! : !allowed.has(room)（matrix.ts）
 * 维度坐标：`processBatch` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-184.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-184 · processBatch · 状态分支 × 合法迁移", () => {
  it("skips an event from a room Piko is not in", async () => {
    // 步骤 1：构造 store、有讨论上下文的 run 与 runtime
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!other:test"] }),
      });

      // 步骤 2：调用 processBatch(房间不在允许集里的事件, "cursor-1")
      await (matrix as unknown as { processBatch(e: unknown[], c: string): Promise<void> }).processBatch(
        [event("$one")],
        "cursor-1",
      );

      // 步骤 3：断言没有被 ingest（房间被移出允许集）
      expect(store.hasMatrixEvent("!room:test", "$one")).toBe(false);
    } finally {
      store.close();
    }
  });

});
