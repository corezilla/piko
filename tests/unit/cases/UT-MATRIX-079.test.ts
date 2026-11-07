/**
 * Case ID: UT-MATRIX-079  ·  STATUS: real
 *
 * 责任：分支 L124 if : if (code==="M_UNKNOWN_TOKEN"||code==="M_FORBI（matrix.ts）
 * 维度坐标：`isPermanentMatrixError` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-079.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-079 · isPermanentMatrixError · 状态分支 × 合法迁移", () => {
  it("marks every listed code as permanent", () => {
    // 步骤 1：逐个构造四种永久码
    for (const code of ["M_UNKNOWN_TOKEN", "M_FORBIDDEN", "M_UNKNOWN_ROOM", "M_BAD_JSON"]) {
      // 步骤 2：调用 isPermanentMatrixError
      // 步骤 3：断言判为永久
      expect(isPermanentMatrixError({ errcode: code })).toBe(true);
    }
  });

});
