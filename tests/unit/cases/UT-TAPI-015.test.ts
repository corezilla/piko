/**
 * Case ID: UT-TAPI-015  ·  STATUS: real
 *
 * 责任：分支 L3 ?. : header?.startsWith（auth.ts）
 * 维度坐标：`authenticate` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-015.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { BearerAuth } from "../../../src/auth.js";
import { PikoError } from "../../../src/types.js";

const TOKEN = Buffer.from("s3cret-token");

describe("UT-TAPI-015 · authenticate · 状态分支 × 合法迁移", () => {
  it("short-circuits the optional chain when the header is undefined", () => {
    // 步骤 1：构造 BearerAuth("p", TOKEN)
    const auth = new BearerAuth("p", TOKEN);

    // 步骤 2：调用 authenticate(undefined)
    // 步骤 3：断言走可选链的 undefined 侧，错误是缺失凭据而非令牌不匹配
    expect(() => auth.authenticate(undefined)).toThrow("missing bearer credential");
  });
});
