/**
 * Case ID: UT-MATRIX-073  ·  STATUS: real
 *
 * 责任：参数 `error: unknown` 的 `非法值` 类（matrix.ts:120）
 * 维度坐标：`isPermanentMatrixError` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-073.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-073 · isPermanentMatrixError · 纯函数/无副作用 × 非法值", () => {
  it("treats a 5xx status as retryable", () => {
    // 步骤 1：构造 503 的错误
    // 步骤 2：调用 isPermanentMatrixError
    // 步骤 3：断言判为可重试（5xx 不在 4xx 区间）
    expect(isPermanentMatrixError({ httpStatus: 503 })).toBe(false);
  });

});
