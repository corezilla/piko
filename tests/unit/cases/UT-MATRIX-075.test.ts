/**
 * Case ID: UT-MATRIX-075  ·  STATUS: real
 *
 * 责任：分支 L121 || : !error||typeof error!=="object"（matrix.ts）
 * 维度坐标：`isPermanentMatrixError` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-075.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-075 · isPermanentMatrixError · 状态分支 × 合法迁移", () => {
  it("returns false for a number error", () => {
    // 步骤 1：构造数字
    // 步骤 2：调用 isPermanentMatrixError
    // 步骤 3：断言判为可重试
    expect(isPermanentMatrixError(42)).toBe(false);
  });

});
