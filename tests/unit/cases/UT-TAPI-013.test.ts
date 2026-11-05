/**
 * Case ID: UT-TAPI-013  ·  STATUS: real
 *
 * 责任：参数 `header` 的 `注入字符` 类（auth.ts:3）
 * 维度坐标：`authenticate` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-013.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { BearerAuth } from "../../../src/auth.js";
import { PikoError } from "../../../src/types.js";

const TOKEN = Buffer.from("s3cret-token");

describe("UT-TAPI-013 · authenticate · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected header as data", () => {
    // 步骤 1：构造 BearerAuth("p", TOKEN)
    const auth = new BearerAuth("p", TOKEN);

    // 步骤 2：调用 authenticate(注入形态的头)
    // 步骤 3：断言被当作普通字符串比对，不执行
    expect(() => auth.authenticate("Bearer $(rm -rf /)`; DROP TABLE x")).toThrow(/invalid bearer credential/);
  });
});
