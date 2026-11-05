/**
 * Case ID: UT-BOOT-073  ·  STATUS: real
 *
 * 责任：参数 `path: string` 的 `注入字符` 类（config.ts:86）
 * 维度坐标：`loadConfig` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-073.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { loadConfig } from "../../../src/config.js";
import { mkdtemp, writeFile, rm, mkdir, readFile, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-073 · loadConfig · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected config path as a path, not a command", async () => {
    // 步骤 1：构造注入形态的 path
    const path = "/tmp/$(whoami); rm -rf /.json";

    // 步骤 2：调用 loadConfig(path, ROOT)
    // 步骤 3：断言被拒绝（只当作文件路径读，不执行）
    await expect(loadConfig(path, ROOT)).rejects.toThrow();
  });
});
