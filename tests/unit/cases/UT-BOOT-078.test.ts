/**
 * Case ID: UT-BOOT-078  ·  STATUS: real
 *
 * 责任：`loadConfig` × `状态分支` × `合法迁移`（粗粒度登记）
 * 维度坐标：`loadConfig` × `状态分支` × `合法迁移`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-078.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { loadConfig } from "../../../src/config.js";
import { join } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-078 · loadConfig · 状态分支 × 合法迁移", () => {
  it("never reaches the onRawUsage check: the schema step rejects first", async () => {
    // 当前实况（G-UT-CONFIG-1）：schema 步先拒绝，harness 扩展点检查不可达
    await expect(loadConfig(join(ROOT, "config/runtime.json"), ROOT)).rejects.toThrow(/transfer/);
  });
});
