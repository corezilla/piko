/**
 * Case ID: UT-BOOT-012  ·  STATUS: real
 *
 * 责任：参数 `ref: string` 的 `超长` 类（config.ts:132）
 * 维度坐标：`resolveSecret` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-012.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { resolveSecret } from "../../../src/config.js";

describe("UT-BOOT-012 · resolveSecret · 字符串/路径/枚举输入 × 超长", () => {
  it("treats an over-long reference as an unavailable provider", async () => {
    // 步骤 1：构造 1000 字符的 ref（无冒号 → kind 为整串）
    const ref = "x".repeat(1000);

    // 步骤 2：调用 resolveSecret(ref)
    // 步骤 3：断言 typed 错误
    await expect(resolveSecret(ref)).rejects.toThrow(/secret provider/);
  });
});
