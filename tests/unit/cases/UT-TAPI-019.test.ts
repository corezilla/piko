/**
 * Case ID: UT-TAPI-019  ·  STATUS: real
 *
 * 责任：throw L3 Unauthorized（守卫 `if (got.length!==this.token.length||!timingSafeEqual(...))`；auth.ts）
 * 维度坐标：`authenticate` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-019.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { BearerAuth } from "../../../src/auth.js";
import { PikoError } from "../../../src/types.js";

const TOKEN = Buffer.from("s3cret-token");

describe("UT-TAPI-019 · authenticate · 错误路径 × 每个 typed 错误码", () => {
  it("throws the declared invalid-credential error", () => {
    // 步骤 1：构造 BearerAuth("p", TOKEN)
    const auth = new BearerAuth("p", TOKEN);

    // 步骤 2：调用 authenticate("Bearer wrong")
    // 步骤 3：断言 typed 错误码与状态码逐值对账
    try {
      auth.authenticate("Bearer wrong");
      expect.unreachable("应当抛出");
    } catch (e) {
      expect((e as PikoError).code).toBe("Unauthorized");
      expect((e as PikoError).status).toBe(401);
      expect((e as PikoError).message).toBe("invalid bearer credential");
    }
  });
});
