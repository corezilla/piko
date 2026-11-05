/**
 * Case ID: UT-TAPI-008  ·  STATUS: real
 *
 * 责任：参数 `token: Buffer` 的 `空` 类（auth.ts:3）
 * 维度坐标：`BearerAuth.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-008.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { BearerAuth } from "../../../src/auth.js";
import { PikoError } from "../../../src/types.js";

const TOKEN = Buffer.from("s3cret-token");

describe("UT-TAPI-008 · BearerAuth.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts an empty token buffer", () => {
    // 步骤 1：构造 BearerAuth("p", Buffer.alloc(0))
    const auth = new BearerAuth("p", Buffer.alloc(0));

    // 步骤 2：调用 authenticate("Bearer ") —— 令牌部分也是空
    // 步骤 3：断言通过（长度相等且内容相等）
    expect(auth.authenticate("Bearer ")).toBe("p");
  });
});
