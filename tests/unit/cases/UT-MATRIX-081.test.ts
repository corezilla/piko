/**
 * Case ID: UT-MATRIX-081  ·  STATUS: real
 *
 * 责任：分支 L124 || : code==="M_UNKNOWN_TOKEN"||code==="M_FORBIDDEN（matrix.ts）（后半）
 * 维度坐标：`isPermanentMatrixError` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-081.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-081 · isPermanentMatrixError · 状态分支 × 合法迁移", () => {
  it("marks M_UNKNOWN_ROOM and M_BAD_JSON as permanent", () => {
    // 步骤 1：构造列表后半的两个码
    // 步骤 2：分别调用 isPermanentMatrixError
    // 步骤 3：断言都判为永久
    expect(isPermanentMatrixError({ errcode: "M_UNKNOWN_ROOM" })).toBe(true);
    expect(isPermanentMatrixError({ errcode: "M_BAD_JSON" })).toBe(true);
  });

});
