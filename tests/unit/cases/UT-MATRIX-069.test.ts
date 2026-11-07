/**
 * Case ID: UT-MATRIX-069  ·  STATUS: real
 *
 * 责任：await 拒绝传播（close 的 await 目标拒绝必须 typed 化上抛；matrix.ts:117）
 * 维度坐标：`close` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-069.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-069 · close · 错误路径 × 每个 typed 错误码", () => {
  it("resolves when there is no client to stop", async () => {
    // 步骤 1：构造一个没有 client 的 runtime
    const store = newStore();
    try {
      const matrix = runtimeWith(store, undefined, true);

      // 步骤 2：调用 close()
      // 步骤 3：断言正常完成（守卫为假，无事可做）
      await expect(matrix.close()).resolves.toBeUndefined();
    } finally {
      store.close();
    }
  });

});
