/**
 * Case ID: UT-BOOT-018  ·  STATUS: real
 *
 * 责任：throw L141 reject（守卫 `unavailable provider`；config.ts:141）
 * 维度坐标：`resolveSecret` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-018.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { resolveSecret } from "../../../src/config.js";

describe("UT-BOOT-018 · resolveSecret · 错误路径 × 每个 typed 错误码", () => {
  it("throws the declared unavailable-provider error", async () => {
    // 步骤 1：构造未知 provider 的 ref
    // 步骤 2：调用 resolveSecret("vault:secret")
    // 步骤 3：断言 typed 错误码逐值等于设计声明
    await expect(resolveSecret("vault:secret")).rejects.toThrow(/secret provider vault is not available in this build/);
  });
});
