/**
 * Case ID: UT-TAPI-012  ·  STATUS: real
 *
 * 责任：参数 `header` 的 `超长` 类（auth.ts:3）
 * 维度坐标：`authenticate` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-012.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { BearerAuth } from "../../../src/auth.js";
import { PikoError } from "../../../src/types.js";

const TOKEN = Buffer.from("s3cret-token");

describe("UT-TAPI-012 · authenticate · 字符串/路径/枚举输入 × 超长", () => {
  it("rejects an over-long header", () => {
    // 步骤 1：构造 BearerAuth("p", TOKEN)
    const auth = new BearerAuth("p", TOKEN);

    // 步骤 2：调用 authenticate(1000 字符头)
    // 步骤 3：断言被拒（令牌不匹配）
    expect(() => auth.authenticate(`Bearer ${"x".repeat(1000)}`)).toThrow(/invalid bearer credential/);
  });
});
