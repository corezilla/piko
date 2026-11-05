/**
 * Case ID: UT-BOOT-017  ·  STATUS: real
 *
 * 责任：throw L137 reject（守卫 `if (!v)`；config.ts:137）
 * 维度坐标：`resolveSecret` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-017.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { resolveSecret } from "../../../src/config.js";

describe("UT-BOOT-017 · resolveSecret · 错误路径 × 每个 typed 错误码", () => {
  it("throws the declared missing-env error", async () => {
    // 步骤 1：确保环境变量不存在
    delete process.env.PIKO_UT_ABSENT;

    // 步骤 2：调用 resolveSecret("env:PIKO_UT_ABSENT")
    // 步骤 3：断言 typed 错误码逐值等于设计声明
    await expect(resolveSecret("env:PIKO_UT_ABSENT")).rejects.toThrow(/missing env secret PIKO_UT_ABSENT/);
  });
});
