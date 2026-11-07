/**
 * Case ID: UT-MATRIX-004  ·  STATUS: real
 *
 * 责任：`isPermanentMatrixError` × `纯函数/无副作用` × `每等价类合法值`（波次一粗粒度登记）
 * 维度坐标：`isPermanentMatrixError` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-004.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-004 · isPermanentMatrixError · 纯函数/无副作用 × 每等价类合法值", () => {
  it("separates permanent failures from retryable ones", () => {
    // 步骤 1：构造永久错误与可重试错误各一
    // 步骤 2：分别调用 isPermanentMatrixError
    // 步骤 3：断言分类正确
    expect(isPermanentMatrixError({ errcode: "M_FORBIDDEN" })).toBe(true);
    expect(isPermanentMatrixError({ httpStatus: 503 })).toBe(false);
  });

});
