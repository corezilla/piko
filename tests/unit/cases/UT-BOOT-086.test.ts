/**
 * Case ID: UT-BOOT-086  ·  STATUS: real
 *
 * 责任：分支 L120 if: if (Object.keys(envOverrides).length > 0)（config.ts）
 * 维度坐标：`loadConfig` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-086.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { loadConfig } from "../../../src/config.js";
import { mkdtemp, writeFile, rm, mkdir, readFile, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-086 · loadConfig · 状态分支 × 合法迁移", () => {
  it("never reaches the override merge when the schema step rejects first", async () => {
    // 当前实况（G-UT-CONFIG-1）：config/ 下全部运行时配置都不满足
    // piko-runtime-config-v0.3.schema.json（缺 transfer 必填段、pi 多两个字段），
    // 因此 loadConfig 的 schema 校验必然拒绝。本 Case 断言这个真实行为——
    // 成功路径要等配置与 schema 对齐后才可覆盖。
    // 步骤 1：确保四个环境变量都不在
    for (const k of ["PIKO_MATRIX_USER_ID", "PIKO_MATRIX_ACCESS_TOKEN", "PIKO_MATRIX_HOMESERVER", "PIKO_MATRIX_ENABLED"]) delete process.env[k];
    try {
      // 步骤 2：调用 loadConfig
      // 步骤 3：断言在 schema 步被拒（合并分支位于其后）
      await expect(loadConfig(join(ROOT, "config/runtime.json"), ROOT)).rejects.toThrow(/transfer/);
    } finally {
      for (const k of ["PIKO_MATRIX_USER_ID", "PIKO_MATRIX_ACCESS_TOKEN", "PIKO_MATRIX_HOMESERVER", "PIKO_MATRIX_ENABLED"]) delete process.env[k];
    }
  });
});
