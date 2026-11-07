/**
 * Case ID: UT-MATRIX-080  ·  STATUS: real
 *
 * 责任：分支 L124 || : code==="M_UNKNOWN_TOKEN"||code==="M_FORBIDDEN（matrix.ts）
 * 维度坐标：`isPermanentMatrixError` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-080.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-080 · isPermanentMatrixError · 状态分支 × 合法迁移", () => {
  it("does not mark an unknown code as permanent", () => {
    // 步骤 1：构造一个未列出的码
    // 步骤 2：调用 isPermanentMatrixError
    // 步骤 3：断言判为可重试（码不在列表里）
    expect(isPermanentMatrixError({ errcode: "M_SOMETHING_ELSE" })).toBe(false);
  });

});
