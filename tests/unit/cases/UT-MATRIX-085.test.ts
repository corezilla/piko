/**
 * Case ID: UT-MATRIX-085  ·  STATUS: real
 *
 * 责任：分支 L127 if : if (/credential identity mismatch|no longer j（matrix.ts）
 * 维度坐标：`isPermanentMatrixError` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-085.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-085 · isPermanentMatrixError · 状态分支 × 合法迁移", () => {
  it("marks the identity and membership messages as permanent", () => {
    // 步骤 1：构造两种永久消息
    // 步骤 2：分别调用 isPermanentMatrixError
    // 步骤 3：断言都判为永久
    expect(isPermanentMatrixError({ message: "Matrix credential identity mismatch" })).toBe(true);
    expect(isPermanentMatrixError({ message: "Piko is no longer joined to the room" })).toBe(true);
  });

});
