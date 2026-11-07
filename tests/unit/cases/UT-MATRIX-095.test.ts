/**
 * Case ID: UT-MATRIX-095  ·  STATUS: real
 *
 * 责任：参数 `store` 的 `边界(上/下/零/空/满)` 类（matrix.ts:14）
 * 维度坐标：`MatrixRuntime.constructor` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-095.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-095 · MatrixRuntime.constructor · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("binds an empty store", () => {
    // 步骤 1：构造空 store 与 runtime
    const store = newStore();
    try {
      const matrix = new MatrixRuntime(config, store);

      // 步骤 2：断言构造成功
      expect((matrix as unknown as { store: unknown }).store).toBe(store);
    } finally {
      store.close();
    }
  });

});
