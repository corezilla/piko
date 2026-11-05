/**
 * Case ID: UT-BOOT-077  ·  STATUS: real
 *
 * 责任：`loadConfig` × `错误路径` × `每个 typed 错误码`（粗粒度登记）
 * 维度坐标：`loadConfig` × `错误路径` × `每个 typed 错误码`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-077.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { loadConfig } from "../../../src/config.js";
import { join } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-077 · loadConfig · 错误路径 × 每个 typed 错误码", () => {
  it("rejects the shipped config before the tool registry is validated", async () => {
    // 当前实况（G-UT-CONFIG-1）：schema 步先拒绝，工具注册表的校验不可达
    await expect(loadConfig(join(ROOT, "config/runtime.json"), ROOT)).rejects.toThrow(/transfer/);
  });
});
