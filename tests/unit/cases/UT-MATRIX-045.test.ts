/**
 * Case ID: UT-MATRIX-045  ·  STATUS: real
 *
 * 责任：throw L108 Matrix disabled（matrix.ts:107）
 * 维度坐标：`send` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-045.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-045 · send · 错误路径 × 每个 typed 错误码", () => {
  it("throws the declared matrix-disabled error", async () => {
    // 步骤 1：构造一个没有 client 的 runtime
    const store = newStore();
    try {
      const matrix = runtimeWith(store, undefined, true);

      // 步骤 2：调用 send
      // 步骤 3：断言错误消息逐值对账
      await expect(matrix.send("!room:test", "txn", "body")).rejects.toThrow("Matrix disabled");
    } finally {
      store.close();
    }
  });

});
