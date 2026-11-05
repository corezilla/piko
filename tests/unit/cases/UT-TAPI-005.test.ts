/**
 * Case ID: UT-TAPI-005  ·  STATUS: real
 *
 * 责任：参数 `principal: string` 的 `空` 类（auth.ts:3）
 * 维度坐标：`BearerAuth.constructor` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-005.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { BearerAuth } from "../../../src/auth.js";
import { PikoError } from "../../../src/types.js";

const TOKEN = Buffer.from("s3cret-token");

describe("UT-TAPI-005 · BearerAuth.constructor · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty principal", () => {
    // 步骤 1：构造 BearerAuth("", TOKEN)
    const auth = new BearerAuth("", TOKEN);

    // 步骤 2：调用 authenticate(正确令牌)
    // 步骤 3：断言返回空串（该参数无校验）
    expect(auth.authenticate("Bearer s3cret-token")).toBe("");
  });
});
