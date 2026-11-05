/**
 * Case ID: UT-TAPI-011  ·  STATUS: real
 *
 * 责任：参数 `header: string | undefined` 的 `空` 类（auth.ts:3）
 * 维度坐标：`authenticate` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-011.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { BearerAuth } from "../../../src/auth.js";
import { PikoError } from "../../../src/types.js";

const TOKEN = Buffer.from("s3cret-token");

describe("UT-TAPI-011 · authenticate · 字符串/路径/枚举输入 × 空", () => {
  it("rejects an undefined header", () => {
    // 步骤 1：构造 BearerAuth("p", TOKEN)
    const auth = new BearerAuth("p", TOKEN);

    // 步骤 2：调用 authenticate(undefined)
    // 步骤 3：断言 typed 错误 code 逐值等于 Unauthorized
    expect(() => auth.authenticate(undefined)).toThrow(PikoError);
    try {
      auth.authenticate(undefined);
    } catch (e) {
      expect((e as PikoError).code).toBe("Unauthorized");
      expect((e as PikoError).status).toBe(401);
      expect((e as PikoError).message).toBe("missing bearer credential");
    }
  });
});
