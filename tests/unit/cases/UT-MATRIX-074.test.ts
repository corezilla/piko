/**
 * Case ID: UT-MATRIX-074  ·  STATUS: real
 *
 * 责任：分支 L121 if : if (!error||typeof error!=="object")（matrix.ts）
 * 维度坐标：`isPermanentMatrixError` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-074.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-074 · isPermanentMatrixError · 状态分支 × 合法迁移", () => {
  it("returns false for a non-object error", () => {
    // 步骤 1：构造三种非对象
    // 步骤 2：分别调用 isPermanentMatrixError
    // 步骤 3：断言都判为可重试（非对象无从判定）
    expect(isPermanentMatrixError(null)).toBe(false);
    expect(isPermanentMatrixError(undefined)).toBe(false);
    expect(isPermanentMatrixError("boom")).toBe(false);
  });

});
