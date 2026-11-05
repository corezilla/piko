/**
 * Case ID: UT-BOOT-011  ·  STATUS: real
 *
 * 责任：参数 `ref: string` 的 `空` 类（config.ts:132）
 * 维度坐标：`resolveSecret` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-011.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { resolveSecret } from "../../../src/config.js";

describe("UT-BOOT-011 · resolveSecret · 字符串/路径/枚举输入 × 空", () => {
  it("rejects an empty reference with an unavailable-provider error", async () => {
    // 步骤 1：构造 ref＝""（空串）
    // 步骤 2：调用 resolveSecret("")
    // 步骤 3：断言 typed 错误（provider 为空串 → 不可用）
    await expect(resolveSecret("")).rejects.toThrow(/secret provider  is not available/);
  });
});
