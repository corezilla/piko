/**
 * Case ID: UT-TAPI-009  ·  STATUS: real
 *
 * 责任：参数 `token: Buffer` 的 `超长` 类（auth.ts:3）
 * 维度坐标：`BearerAuth.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-009.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { BearerAuth } from "../../../src/auth.js";
import { PikoError } from "../../../src/types.js";

const TOKEN = Buffer.from("s3cret-token");

describe("UT-TAPI-009 · BearerAuth.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts a large token buffer", () => {
    // 步骤 1：构造 64 KiB 的令牌
    const token = Buffer.alloc(64 * 1024, 7);
    const auth = new BearerAuth("p", token);

    // 步骤 2：调用 authenticate(对应的头)
    // 步骤 3：断言通过
    expect(auth.authenticate(`Bearer ${token.toString("latin1")}`)).toBe("p");
  });
});
