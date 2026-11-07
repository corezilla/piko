/**
 * Case ID: UT-MATRIX-088  ·  STATUS: real
 *
 * 责任：返回站点 L125 值 （4xx 状态码）
 * 维度坐标：`isPermanentMatrixError` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-088.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-088 · isPermanentMatrixError · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns true for a permanent 4xx status", () => {
    expect(isPermanentMatrixError({ httpStatus: 404 })).toBe(true);
  });

});
