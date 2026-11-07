/**
 * Case ID: UT-MATRIX-071  ·  STATUS: real
 *
 * 责任：参数 `error: unknown` 的 `每等价类合法值` 类（matrix.ts:120）
 * 维度坐标：`isPermanentMatrixError` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-071.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-071 · isPermanentMatrixError · 纯函数/无副作用 × 每等价类合法值", () => {
  it("recognises the permanent error codes", () => {
    // 步骤 1：构造四种永久错误码
    for (const code of ["M_UNKNOWN_TOKEN", "M_FORBIDDEN", "M_UNKNOWN_ROOM", "M_BAD_JSON"]) {
      // 步骤 2：调用 isPermanentMatrixError
      // 步骤 3：断言都判为永久（不可重试）
      expect(isPermanentMatrixError({ errcode: code })).toBe(true);
    }
  });

});
