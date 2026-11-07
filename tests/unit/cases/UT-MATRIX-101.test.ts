/**
 * Case ID: UT-MATRIX-101  ·  STATUS: real
 *
 * 责任：分支 L16 if : if (!this.config.matrix.enabled)（matrix.ts）
 * 维度坐标：`start` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-101.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-101 · start · 状态分支 × 合法迁移", () => {
  it("returns immediately when Matrix is disabled", async () => {
    // 步骤 1：构造 matrix.enabled 为 false 的 config
    const store = newStore();
    try {
      const disabled = { ...config, matrix: { ...config.matrix, enabled: false } } as RuntimeConfig;
      const matrix = new MatrixRuntime(disabled, store);

      // 步骤 2：调用 start()
      await matrix.start();

      // 步骤 3：断言未建 client、未启动（守卫为真即返回）
      expect((matrix as unknown as { client: unknown }).client).toBeUndefined();
      expect((matrix as unknown as { started: boolean }).started).toBe(false);
    } finally {
      store.close();
    }
  });

});
