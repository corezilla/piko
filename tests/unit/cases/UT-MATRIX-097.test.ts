/**
 * Case ID: UT-MATRIX-097  ·  STATUS: real
 *
 * 责任：参数 `token` 的 `空` 类（matrix.ts:14）
 * 维度坐标：`MatrixRuntime.constructor` × `纯函数/无副作用` × `空`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-097.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-097 · MatrixRuntime.constructor · 纯函数/无副作用 × 空", () => {
  it("binds an empty token", () => {
    // 步骤 1：构造空 token 的 runtime
    const store = newStore();
    try {
      const matrix = new MatrixRuntime(config, store, "");

      // 步骤 2：读回 token
      // 步骤 3：断言原样保留（该参数无校验）
      expect((matrix as unknown as { token: string }).token).toBe("");
    } finally {
      store.close();
    }
  });

});
