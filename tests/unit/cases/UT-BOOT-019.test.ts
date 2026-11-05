/**
 * Case ID: UT-BOOT-019  ·  STATUS: real
 *
 * 责任：返回站点 L138 值 `v` 逐值断言（config.ts）
 * 维度坐标：`resolveSecret` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-019.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { resolveSecret } from "../../../src/config.js";

describe("UT-BOOT-019 · resolveSecret · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the environment value verbatim", async () => {
    // 步骤 1：注入带前后空格的环境变量
    process.env.PIKO_UT_SPACED = "  padded  ";
    try {
      // 步骤 2：调用 resolveSecret("env:PIKO_UT_SPACED")
      const value = await resolveSecret("env:PIKO_UT_SPACED");
      // 步骤 3：断言返回值逐值对账（env 分支不做 trim）
      expect(value).toBe("  padded  ");
    } finally {
      delete process.env.PIKO_UT_SPACED;
    }
  });
});
