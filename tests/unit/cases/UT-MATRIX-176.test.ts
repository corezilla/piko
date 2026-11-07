/**
 * Case ID: UT-MATRIX-176  ·  STATUS: real
 *
 * 责任：分支 L86 if : if (rooms.size)（matrix.ts）
 * 维度坐标：`processBatch` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-176.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-176 · processBatch · 状态分支 × 合法迁移", () => {
  it("checks membership only when there are rooms in use", async () => {
    // 步骤 1：构造 store 与一个会记录调用的 client
    const store = newStore();
    let calls = 0;
    try {
      const matrix = runtimeWith(store, {
        getJoinedRooms: async () => {
          calls += 1;
          return { joined_rooms: [] };
        },
      });

      // 步骤 2：调用 processBatch(没有讨论上下文的事件, "cursor-1")
      await (matrix as unknown as { processBatch(e: unknown[], c: string): Promise<void> }).processBatch(
        [event("$one")],
        "cursor-1",
      );

      // 步骤 3：断言没有房间需要查成员资格
      expect(calls).toBe(0);
    } finally {
      store.close();
    }
  });

});
