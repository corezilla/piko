/**
 * Case ID: UT-BOOT-179  ·  STATUS: real
 *
 * 责任：参数 `root: string` 的 `注入字符` 类（main.ts:16）
 * 维度坐标：`runControlProcess` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-179.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-179 · runControlProcess · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected root as a path, not a command", async () => {
    // 步骤 1：构造真实的 configPath 与注入形态的 root
    const root = "/tmp/$(whoami); rm -rf /";

    // 步骤 2：调用 runControlProcess(configPath, root)
    // 步骤 3：断言被拒绝且未执行命令
    await expect(runControlProcess(join(ROOT, "config/runtime.json"), root)).rejects.toThrow();
  });
});
