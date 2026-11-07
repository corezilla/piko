/**
 * Case ID: UT-MATRIX-126  ·  STATUS: real
 *
 * 责任：返回站点 L16 值 `（无值 return：提前退出）` 逐值断言（matrix.ts）
 * 维度坐标：`start` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-126.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-126 · start · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns undefined when Matrix is disabled", async () => {
    // 步骤 1：构造 matrix.enabled 为 false 的 config
    const store = newStore();
    try {
      const disabled = { ...config, matrix: { ...config.matrix, enabled: false } } as RuntimeConfig;
      const matrix = new MatrixRuntime(disabled, store);

      // 步骤 2：调用 start()
      // 步骤 3：断言返回 undefined（提前退出）
      await expect(matrix.start()).resolves.toBeUndefined();
    } finally {
      store.close();
    }
  });

});
