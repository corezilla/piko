/**
 * Case ID: UT-TAPI-017  ·  STATUS: real
 *
 * 责任：分支 L3 ! : !timingSafeEqual(got,this.token)（auth.ts）
 * 维度坐标：`authenticate` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-017.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { BearerAuth } from "../../../src/auth.js";
import { PikoError } from "../../../src/types.js";

const TOKEN = Buffer.from("s3cret-token");

describe("UT-TAPI-017 · authenticate · 状态分支 × 合法迁移", () => {
  it("takes the content-mismatch side when the token differs", () => {
    // 步骤 1：构造 BearerAuth("p", Buffer.from("abc"))
    const auth = new BearerAuth("p", Buffer.from("abc"));

    // 步骤 2：调用 authenticate("Bearer xyz") —— 长度同但内容不同
    // 步骤 3：断言错误消息逐值等于 invalid bearer credential
    expect(() => auth.authenticate("Bearer xyz")).toThrow("invalid bearer credential");
  });
});
