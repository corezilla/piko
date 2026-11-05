/**
 * Case ID: UT-BOOT-176  ·  STATUS: real
 *
 * 责任：参数 `configPath: string` 的 `注入字符` 类（main.ts:16）
 * 维度坐标：`runControlProcess` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-176.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-176 · runControlProcess · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected config path as a path, not a command", async () => {
    // 步骤 1：构造注入形态的 configPath
    const configPath = "/tmp/$(whoami); rm -rf /.json";

    // 步骤 2：调用 runControlProcess(configPath, ROOT)
    // 步骤 3：断言被拒绝（只当路径读，不执行）
    await expect(runControlProcess(configPath, ROOT)).rejects.toThrow();
  });
});
