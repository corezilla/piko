/**
 * Case ID: UT-IPC-181  ·  STATUS: real
 *
 * 责任：参数 `message: string` 的 `空` 类（types.ts:233）
 * 维度坐标：`PikoError.constructor` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-181.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { PikoError } from "../../../src/types.js";

describe("UT-IPC-181 · PikoError.constructor · 字符串/路径/枚举输入 × 空", () => {
  it("keeps an empty message", () => {
    // 步骤 1：构造 message 为空的错误
    const error = new PikoError("X", 500, "");

    // 步骤 2：读回 message
    // 步骤 3：断言逐值对账
    expect(error.message).toBe("");
  });
});
