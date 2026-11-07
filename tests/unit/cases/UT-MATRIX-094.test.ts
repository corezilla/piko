/**
 * Case ID: UT-MATRIX-094  ·  STATUS: real
 *
 * 责任：参数 `store` 的 `每等价类合法值` 类（matrix.ts:14）
 * 维度坐标：`MatrixRuntime.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-094.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-094 · MatrixRuntime.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("binds the store for the membership audit", () => {
    // 步骤 1：构造 store 与 runtime
    const store = newStore();
    try {
      const matrix = new MatrixRuntime(config, store);

      // 步骤 2：断言 store 被持有（读回私有字段）
      expect((matrix as unknown as { store: unknown }).store).toBe(store);
    } finally {
      store.close();
    }
  });

});
