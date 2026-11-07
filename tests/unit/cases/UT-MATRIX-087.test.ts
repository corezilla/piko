/**
 * Case ID: UT-MATRIX-087  ·  STATUS: real
 *
 * 责任：返回站点 L124 值 （永久错误码）
 * 维度坐标：`isPermanentMatrixError` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-087.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-087 · isPermanentMatrixError · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns true for a permanent error code", () => {
    expect(isPermanentMatrixError({ errcode: "M_FORBIDDEN" })).toBe(true);
  });

});
