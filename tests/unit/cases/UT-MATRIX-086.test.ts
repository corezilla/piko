/**
 * Case ID: UT-MATRIX-086  ·  STATUS: real
 *
 * 责任：返回站点 L121 值 （非对象的错误）
 * 维度坐标：`isPermanentMatrixError` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-086.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-086 · isPermanentMatrixError · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns false for a non-object error", () => {
    expect(isPermanentMatrixError("boom")).toBe(false);
  });

});
