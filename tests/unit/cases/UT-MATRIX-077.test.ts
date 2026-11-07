/**
 * Case ID: UT-MATRIX-077  ·  STATUS: real
 *
 * 责任：分支 L123 ?? : e.errcode??e.data?.errcode（matrix.ts）
 * 维度坐标：`isPermanentMatrixError` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-077.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-077 · isPermanentMatrixError · 状态分支 × 合法迁移", () => {
  it("reads the code from the top level when there is one", () => {
    // 步骤 1：构造带顶层 errcode 的错误
    // 步骤 2：调用 isPermanentMatrixError
    // 步骤 3：断言按顶层码判定为永久
    expect(isPermanentMatrixError({ errcode: "M_FORBIDDEN" })).toBe(true);
  });

});
