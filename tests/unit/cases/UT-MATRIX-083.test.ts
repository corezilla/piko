/**
 * Case ID: UT-MATRIX-083  ·  STATUS: real
 *
 * 责任：分支 L125 && : typeof e.httpStatus==="number"&&e.httpStatus>（matrix.ts）
 * 维度坐标：`isPermanentMatrixError` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-083.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-083 · isPermanentMatrixError · 状态分支 × 合法迁移", () => {
  it("marks a 499 status as permanent", () => {
    // 步骤 1：构造 499（区间上界内）
    // 步骤 2：调用 isPermanentMatrixError
    // 步骤 3：断言判为永久
    expect(isPermanentMatrixError({ httpStatus: 499 })).toBe(true);
  });

});
