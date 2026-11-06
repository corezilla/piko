/**
 * Case ID: UT-IPC-176  ·  STATUS: real
 *
 * 责任：参数 `status: number` 的 `−1 通过` 类（types.ts:233）
 * 维度坐标：`PikoError.constructor` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-176.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { PikoError } from "../../../src/types.js";

describe("UT-IPC-176 · PikoError.constructor · 数值/长度上限参数 × −1 通过", () => {
  it("accepts a negative status", () => {
    // 步骤 1：构造 status＝-1 的错误
    const error = new PikoError("X", -1, "boom");

    // 步骤 2：读回 status
    // 步骤 3：断言逐值对账——无下界校验
    expect(error.status).toBe(-1);
  });
});
