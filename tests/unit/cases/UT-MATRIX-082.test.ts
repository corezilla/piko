/**
 * Case ID: UT-MATRIX-082  ·  STATUS: real
 *
 * 责任：分支 L125 if : if (typeof e.httpStatus==="number"&&e.httpSta（matrix.ts）
 * 维度坐标：`isPermanentMatrixError` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-082.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-082 · isPermanentMatrixError · 状态分支 × 合法迁移", () => {
  it("marks a 4xx status as permanent", () => {
    // 步骤 1：构造 403 与 400 的错误
    // 步骤 2：分别调用 isPermanentMatrixError
    // 步骤 3：断言都判为永久（4xx 区间，排除 408/429）
    expect(isPermanentMatrixError({ httpStatus: 403 })).toBe(true);
    expect(isPermanentMatrixError({ httpStatus: 400 })).toBe(true);
  });

});
