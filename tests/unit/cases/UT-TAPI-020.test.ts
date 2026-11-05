/**
 * Case ID: UT-TAPI-020  ·  STATUS: real
 *
 * 责任：返回站点 L3 值 （auth.ts）
 * 维度坐标：`authenticate` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `TAPI`）
 * 用例文档：docs/70_verification/unit/cases/UT-TAPI-020.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { BearerAuth } from "../../../src/auth.js";
import { PikoError } from "../../../src/types.js";

const TOKEN = Buffer.from("s3cret-token");

describe("UT-TAPI-020 · authenticate · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the principal on a valid credential", () => {
    // 步骤 1：构造 BearerAuth("slinky", TOKEN)
    const auth = new BearerAuth("slinky", TOKEN);

    // 步骤 2：调用 authenticate("Bearer s3cret-token")
    // 步骤 3：断言返回值逐值对账
    expect(auth.authenticate("Bearer s3cret-token")).toBe("slinky");
  });
});
