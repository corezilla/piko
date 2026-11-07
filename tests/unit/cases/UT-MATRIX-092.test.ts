/**
 * Case ID: UT-MATRIX-092  ·  STATUS: real
 *
 * 责任：参数 `config` 的 `边界(上/下/零/空/满)` 类（matrix.ts:14）
 * 维度坐标：`MatrixRuntime.constructor` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-092.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-092 · MatrixRuntime.constructor · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("binds a config with matrix disabled", () => {
    // 步骤 1：构造 matrix.enabled 为 false 的 config
    const store = newStore();
    try {
      const disabled = { ...config, matrix: { ...config.matrix, enabled: false } } as RuntimeConfig;
      const matrix = new MatrixRuntime(disabled, store);

      // 步骤 2：断言构造成功且未启动
      expect((matrix as unknown as { started: boolean }).started).toBe(false);
    } finally {
      store.close();
    }
  });

});
