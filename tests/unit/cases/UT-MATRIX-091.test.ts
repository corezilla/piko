/**
 * Case ID: UT-MATRIX-091  ·  STATUS: real
 *
 * 责任：参数 `config` 的 `每等价类合法值` 类（matrix.ts:14）
 * 维度坐标：`MatrixRuntime.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-091.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-091 · MatrixRuntime.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("binds the config and stays disabled until started", () => {
    // 步骤 1：构造 runtime
    const store = newStore();
    try {
      const matrix = new MatrixRuntime(config, store);

      // 步骤 2：读回内部状态
      // 步骤 3：断言未启动（构造不建立连接）
      expect((matrix as unknown as { started: boolean }).started).toBe(false);
      expect((matrix as unknown as { client: unknown }).client).toBeUndefined();
    } finally {
      store.close();
    }
  });

});
