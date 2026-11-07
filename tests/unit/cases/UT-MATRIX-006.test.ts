/**
 * Case ID: UT-MATRIX-006  ·  STATUS: real
 *
 * 责任：`processBatch` × `状态分支` × `合法迁移`（波次一粗粒度登记）
 * 维度坐标：`processBatch` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-006.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-006 · processBatch · 状态分支 × 合法迁移", () => {
  it("ingests a batch and advances the cursor", async () => {
    // 步骤 1：构造 store、有讨论上下文的 run 与 runtime
    const store = newStore();
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => ({ joined_rooms: ["!room:test"] }),
      });

      // 步骤 2：调用 processBatch
      await (matrix as unknown as { processBatch(e: unknown[], c: string): Promise<void> }).processBatch(
        [event("$one")],
        "cursor-1",
      );

      // 步骤 3：断言事件被记下、光标推进
      expect(store.hasMatrixEvent("!room:test", "$one")).toBe(true);
      expect(store.matrixCursor()).toBe("cursor-1");
    } finally {
      store.close();
    }
  });

});
