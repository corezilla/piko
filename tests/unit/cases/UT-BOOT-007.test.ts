/**
 * Case ID: UT-BOOT-007  ·  STATUS: real
 *
 * 责任：`resolveSecret` × `资源获取/释放` × `获取失败路径`（波次一粗粒度登记）
 * 维度坐标：`resolveSecret` × `资源获取/释放` × `获取失败路径`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-007.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { resolveSecret } from "../../../src/config.js";

describe("UT-BOOT-007 · resolveSecret · 资源获取/释放 × 获取失败路径", () => {
  it("fails to acquire a missing env secret", async () => {
    // 步骤 1：确保环境变量不存在
    delete process.env.PIKO_UT_COARSE_ABSENT;

    // 步骤 2：调用 resolveSecret("env:PIKO_UT_COARSE_ABSENT")
    // 步骤 3：断言 typed 错误（获取失败，资源未取得）
    await expect(resolveSecret("env:PIKO_UT_COARSE_ABSENT")).rejects.toThrow(/missing env secret/);
  });
});
