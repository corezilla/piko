/**
 * Case ID: UT-TAPI-007  ·  STATUS: real
 *
 * 责任：参数 `principal: string` 的 `注入字符` 类（auth.ts:3）
 * 维度坐标：`BearerAuth.constructor` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-007.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { BearerAuth } from "../../../src/auth.js";
import { PikoError } from "../../../src/types.js";

const TOKEN = Buffer.from("s3cret-token");

describe("UT-TAPI-007 · BearerAuth.constructor · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected principal as data, not as a command", () => {
    // 步骤 1：构造带注入串的 principal
    const principal = "$(rm -rf /)`; DROP TABLE users;--";
    const auth = new BearerAuth(principal, TOKEN);

    // 步骤 2：调用 authenticate(正确令牌)
    // 步骤 3：断言原样返回、不执行
    expect(auth.authenticate("Bearer s3cret-token")).toBe(principal);
  });
});
