/**
 * Case ID: UT-IPC-174  ·  STATUS: real
 *
 * 责任：参数 `status: number` 的 `恰好通过` 类（types.ts:233）
 * 维度坐标：`PikoError.constructor` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-174.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { PikoError } from "../../../src/types.js";

describe("UT-IPC-174 · PikoError.constructor · 数值/长度上限参数 × 恰好通过", () => {
  it("keeps the status code", () => {
    // 步骤 1：构造 status＝500 的错误
    const error = new PikoError("X", 500, "boom");

    // 步骤 2：读回 status
    // 步骤 3：断言逐值对账（该参数无范围校验）
    expect(error.status).toBe(500);
  });
});
