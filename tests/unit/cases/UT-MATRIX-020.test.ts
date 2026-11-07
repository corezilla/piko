/**
 * Case ID: UT-MATRIX-020  ·  STATUS: real
 *
 * 责任：分支 L102 || : !this.client||!this.started（matrix.ts）
 * 维度坐标：`verifyDiscussion` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-020.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-020 · verifyDiscussion · 状态分支 × 合法迁移", () => {
  it("refuses when the runtime is not ready", async () => {
    // 步骤 1：构造一个没有 client 的 runtime
    const store = newStore();
    try {
      const matrix = runtimeWith(store, undefined, true);

      // 步骤 2：调用 verifyDiscussion
      // 步骤 3：断言被拒（客户端未建立）
      await expect(matrix.verifyDiscussion("!room:test", "$event")).rejects.toThrow(/not ready/);
    } finally {
      store.close();
    }
  });

});
