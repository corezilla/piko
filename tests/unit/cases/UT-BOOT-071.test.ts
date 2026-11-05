/**
 * Case ID: UT-BOOT-071  ·  STATUS: real
 *
 * 责任：参数 `path: string` 的 `空` 类（config.ts:86）
 * 维度坐标：`loadConfig` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-071.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { loadConfig } from "../../../src/config.js";
import { mkdtemp, writeFile, rm, mkdir, readFile, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-071 · loadConfig · 字符串/路径/枚举输入 × 空", () => {
  it("rejects an empty config path", async () => {
    // 步骤 1：构造 path＝""
    // 步骤 2：调用 loadConfig("", ROOT)
    // 步骤 3：断言被拒绝（读不到文件）
    await expect(loadConfig("", ROOT)).rejects.toThrow();
  });
});
