/**
 * Case ID: UT-IPC-182  ·  STATUS: real
 *
 * 责任：参数 `message: string` 的 `超长` 类（types.ts:233）
 * 维度坐标：`PikoError.constructor` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-182.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { PikoError } from "../../../src/types.js";

describe("UT-IPC-182 · PikoError.constructor · 字符串/路径/枚举输入 × 超长", () => {
  it("keeps an over-long message verbatim", () => {
    // 步骤 1：构造 1000 字符的 message
    const message = "m".repeat(1000);

    // 步骤 2：构造 PikoError
    const error = new PikoError("X", 500, message);

    // 步骤 3：断言原样保留
    expect(error.message).toBe(message);
  });
});
