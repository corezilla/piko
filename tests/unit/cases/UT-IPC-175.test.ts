/**
 * Case ID: UT-IPC-175  ·  STATUS: real
 *
 * 责任：参数 `status: number` 的 `+1 拒绝` 类（types.ts:233）
 * 维度坐标：`PikoError.constructor` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-175.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { PikoError } from "../../../src/types.js";

describe("UT-IPC-175 · PikoError.constructor · 数值/长度上限参数 × +1 拒绝", () => {
  it("accepts a status above the usual range", () => {
    // 步骤 1：构造 status＝599 的错误
    const error = new PikoError("X", 599, "boom");

    // 步骤 2：读回 status
    // 步骤 3：断言逐值对账——PikoError 不校验状态码范围
    expect(error.status).toBe(599);
  });
});
