/**
 * Case ID: UT-MATRIX-090  ·  STATUS: real
 *
 * 责任：返回站点 L128 值 （默认返回）
 * 维度坐标：`isPermanentMatrixError` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-090.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-090 · isPermanentMatrixError · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns false for anything else", () => {
    expect(isPermanentMatrixError({ message: "transient failure" })).toBe(false);
  });

});
