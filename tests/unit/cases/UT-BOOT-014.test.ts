/**
 * Case ID: UT-BOOT-014  ·  STATUS: real
 *
 * 责任：分支 L135 if: if (kind === "env")（config.ts）
 * 维度坐标：`resolveSecret` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-014.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { resolveSecret } from "../../../src/config.js";

describe("UT-BOOT-014 · resolveSecret · 状态分支 × 合法迁移", () => {
  it("resolves an env: reference through process.env", async () => {
    // 步骤 1：注入环境变量 PIKO_UT_SECRET="s3cret"
    process.env.PIKO_UT_SECRET = "s3cret";
    try {
      // 步骤 2：调用 resolveSecret("env:PIKO_UT_SECRET")
      // 步骤 3：断言返回值逐值等于环境变量值
      await expect(resolveSecret("env:PIKO_UT_SECRET")).resolves.toBe("s3cret");
    } finally {
      delete process.env.PIKO_UT_SECRET;
    }
  });
});
