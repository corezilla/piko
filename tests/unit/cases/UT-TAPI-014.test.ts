/**
 * Case ID: UT-TAPI-014  ·  STATUS: real
 *
 * 责任：分支 L3 ! : !header?.startsWith("Bearer ")（auth.ts）
 * 维度坐标：`authenticate` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-014.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { BearerAuth } from "../../../src/auth.js";
import { PikoError } from "../../../src/types.js";

const TOKEN = Buffer.from("s3cret-token");

describe("UT-TAPI-014 · authenticate · 状态分支 × 合法迁移", () => {
  it("takes the missing-credential side when the header lacks the Bearer prefix", () => {
    // 步骤 1：构造 BearerAuth("p", TOKEN)
    const auth = new BearerAuth("p", TOKEN);

    // 步骤 2：调用 authenticate("Basic abc")
    // 步骤 3：断言错误消息逐值等于 missing bearer credential
    expect(() => auth.authenticate("Basic abc")).toThrow("missing bearer credential");
  });
});
