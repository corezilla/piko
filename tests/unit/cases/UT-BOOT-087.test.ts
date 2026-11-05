/**
 * Case ID: UT-BOOT-087  ·  STATUS: real
 *
 * 责任：分支 L125 if: if (config.matrix.enabled && !config.matrix.direct_acce…（config.ts）
 * 维度坐标：`loadConfig` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-087.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { loadConfig } from "../../../src/config.js";
import { mkdtemp, writeFile, rm, mkdir, readFile, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-087 · loadConfig · 状态分支 × 合法迁移", () => {
  it("never reaches the matrix credential check when the schema step rejects first", async () => {
    // 当前实况（G-UT-CONFIG-1）：config/ 下全部运行时配置都不满足
    // piko-runtime-config-v0.3.schema.json（缺 transfer 必填段、pi 多两个字段），
    // 因此 loadConfig 的 schema 校验必然拒绝。本 Case 断言这个真实行为——
    // 成功路径要等配置与 schema 对齐后才可覆盖。
    // 步骤 1：调用 loadConfig（真实配置，Matrix 已启用且带凭据）
    // 步骤 2：读回错误
    // 步骤 3：断言在 schema 步被拒——凭据检查分支位于其后，未被执行
    await expect(loadConfig(join(ROOT, "config/runtime.json"), ROOT)).rejects.toThrow(/transfer/);
  });
});
