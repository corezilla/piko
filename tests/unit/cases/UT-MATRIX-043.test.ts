/**
 * Case ID: UT-MATRIX-043  ·  STATUS: real
 *
 * 责任：分支 L108 ! : !this.client（matrix.ts）
 * 维度坐标：`send` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-043.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-043 · send · 状态分支 × 合法迁移", () => {
  it("refuses to send when Matrix is disabled", async () => {
    // 步骤 1：构造一个没有 client 的 runtime
    const store = newStore();
    try {
      const matrix = runtimeWith(store, undefined, true);

      // 步骤 2：调用 send
      // 步骤 3：断言被拒（Matrix 未启用）
      await expect(matrix.send("!room:test", "txn", "body")).rejects.toThrow("Matrix disabled");
    } finally {
      store.close();
    }
  });

});
