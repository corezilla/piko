/**
 * Case ID: UT-MATRIX-100  ·  STATUS: real
 *
 * 责任：可选参数 `token` 缺省/显式两态（matrix.ts:14）
 * 维度坐标：`MatrixRuntime.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-100.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-100 · MatrixRuntime.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("works with and without a token", () => {
    // 步骤 1：缺省 token
    const store = newStore();
    try {
      const without = new MatrixRuntime(config, store);
      expect((without as unknown as { token?: string }).token).toBeUndefined();

      // 步骤 2：显式 token
      const with_ = new MatrixRuntime(config, store, "tok");
      expect((with_ as unknown as { token?: string }).token).toBe("tok");
    } finally {
      store.close();
    }
  });

});
