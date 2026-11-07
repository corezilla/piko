/**
 * Case ID: UT-MATRIX-078  ·  STATUS: real
 *
 * 责任：分支 L123 ?. : e.data?.errcode（matrix.ts）
 * 维度坐标：`isPermanentMatrixError` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-078.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-078 · isPermanentMatrixError · 状态分支 × 合法迁移", () => {
  it("reads the code from data when the top level has none", () => {
    // 步骤 1：构造只带 data.errcode 的错误
    // 步骤 2：调用 isPermanentMatrixError
    // 步骤 3：断言按 data 里的码判定为永久
    expect(isPermanentMatrixError({ data: { errcode: "M_UNKNOWN_ROOM" } })).toBe(true);
  });

});
