/**
 * Case ID: UT-BOOT-015  ·  STATUS: real
 *
 * 责任：分支 L137 !: !v（config.ts）
 * 维度坐标：`resolveSecret` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-015.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { resolveSecret } from "../../../src/config.js";

describe("UT-BOOT-015 · resolveSecret · 状态分支 × 合法迁移", () => {
  it("treats an empty environment value as missing", async () => {
    // 步骤 1：注入空串环境变量
    process.env.PIKO_UT_EMPTY = "";
    try {
      // 步骤 2：调用 resolveSecret("env:PIKO_UT_EMPTY")
      // 步骤 3：断言被拒绝（空串是假值 → 视为缺失）
      await expect(resolveSecret("env:PIKO_UT_EMPTY")).rejects.toThrow(/missing env secret PIKO_UT_EMPTY/);
    } finally {
      delete process.env.PIKO_UT_EMPTY;
    }
  });
});
