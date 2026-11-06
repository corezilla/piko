/**
 * Case ID: UT-IPC-172  ·  STATUS: real
 *
 * 责任：参数 `code: string` 的 `超长` 类（types.ts:233）
 * 维度坐标：`PikoError.constructor` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-172.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { PikoError } from "../../../src/types.js";

describe("UT-IPC-172 · PikoError.constructor · 字符串/路径/枚举输入 × 超长", () => {
  it("keeps an over-long code verbatim", () => {
    // 步骤 1：构造 1000 字符的 code
    const code = "c".repeat(1000);

    // 步骤 2：构造 PikoError
    const error = new PikoError(code, 500, "boom");

    // 步骤 3：断言 code 原样保留（该参数无校验）
    expect(error.code).toBe(code);
    expect(error.message).toBe("boom");
    expect(error.status).toBe(500);
  });
});
