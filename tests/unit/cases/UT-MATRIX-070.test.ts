/**
 * Case ID: UT-MATRIX-070  ·  STATUS: real
 *
 * 责任：状态写 L117 → `this.started=false`（matrix.ts）
 * 维度坐标：`close` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-070.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-070 · close · 状态分支 × 合法迁移", () => {
  it("marks the runtime as not started", async () => {
    // 步骤 1：构造 runtime（有 client、started 为真）
    const store = newStore();
    try {
      const matrix = runtimeWith(store, { stopClient: () => {}, removeAllListeners: () => {} });

      // 步骤 2：调用 close()
      await matrix.close();

      // 步骤 3：断言 started 被清
      expect((matrix as unknown as { started: boolean }).started).toBe(false);
    } finally {
      store.close();
    }
  });

});
