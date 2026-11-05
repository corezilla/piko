/**
 * Case ID: UT-BOOT-177  ·  STATUS: real
 *
 * 责任：参数 `root: string` 的 `空` 类（main.ts:16）
 * 维度坐标：`runControlProcess` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-177.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-177 · runControlProcess · 字符串/路径/枚举输入 × 空", () => {
  it("rejects an empty root", async () => {
    // 步骤 1：构造真实的 configPath 与空 root
    // 步骤 2：调用 runControlProcess(configPath, "")
    // 步骤 3：断言被拒绝（schema 拼在 root 下，读不到）
    await expect(runControlProcess(join(ROOT, "config/runtime.json"), "")).rejects.toThrow();
  });
});
