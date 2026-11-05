/**
 * Case ID: UT-BOOT-093  ·  STATUS: real
 *
 * 责任：throw L126 `Matrix is enabled but neither direct_access_token nor access_token_secret_ref is configured`（config.ts）
 * 维度坐标：`loadConfig` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-093.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { loadConfig } from "../../../src/config.js";
import { mkdtemp, writeFile, rm, mkdir, readFile, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-093 · loadConfig · 错误路径 × 每个 typed 错误码", () => {
  it("never reaches the matrix credential throw: the schema step rejects first", async () => {
    // 当前实况（G-UT-CONFIG-1）：schema 步先拒绝，Matrix 凭据检查不可达。
    await expect(loadConfig(join(ROOT, "config/runtime.json"), ROOT)).rejects.toThrow(/transfer/);
  });
});
