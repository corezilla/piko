/**
 * Case ID: UT-MATRIX-084  ·  STATUS: real
 *
 * 责任：分支 L126 ?? : e.message??""（matrix.ts）
 * 维度坐标：`isPermanentMatrixError` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-084.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-084 · isPermanentMatrixError · 状态分支 × 合法迁移", () => {
  it("reads the message when there is none", () => {
    // 步骤 1：构造一个没有 message 的错误对象
    // 步骤 2：调用 isPermanentMatrixError
    // 步骤 3：断言按空消息判定（不匹配任何永久消息模式）
    expect(isPermanentMatrixError({ errcode: "M_UNKNOWN" })).toBe(false);
  });

});
