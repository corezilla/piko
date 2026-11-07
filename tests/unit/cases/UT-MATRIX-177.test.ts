/**
 * Case ID: UT-MATRIX-177  ·  STATUS: real
 *
 * 责任：分支 L86 loop : loop (rooms)（matrix.ts）
 * 维度坐标：`processBatch` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-177.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-177 · processBatch · 状态分支 × 合法迁移", () => {
  it("checks every room in the batch", async () => {
    // 步骤 1：构造 store 与一个会记录房间的 client
    const store = newStore();
    const checked: string[] = [];
    try {
      store.createOrGet(task, "slinky", 10, "trigger");
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => {
          checked.push("getJoinedRooms");
          return { joined_rooms: ["!room:test"] };
        },
      });

      // 步骤 2：调用 processBatch
      await (matrix as unknown as { processBatch(e: unknown[], c: string): Promise<void> }).processBatch(
        [event("$one")],
        "cursor-1",
      );

      // 步骤 3：断言成员资格被查过一次
      expect(checked).toHaveLength(1);
    } finally {
      store.close();
    }
  });

});
