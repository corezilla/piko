/**
 * Case ID: UT-MATRIX-072  ·  STATUS: real
 *
 * 责任：参数 `error: unknown` 的 `边界(上/下/零/空/满)` 类（matrix.ts:120）
 * 维度坐标：`isPermanentMatrixError` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-072.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-072 · isPermanentMatrixError · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("treats the timeout and rate-limit statuses as retryable", () => {
    // 步骤 1：构造 408 与 429 的错误
    // 步骤 2：分别调用 isPermanentMatrixError
    // 步骤 3：断言都判为可重试（不是永久错误）
    expect(isPermanentMatrixError({ httpStatus: 408 })).toBe(false);
    expect(isPermanentMatrixError({ httpStatus: 429 })).toBe(false);
  });

});
