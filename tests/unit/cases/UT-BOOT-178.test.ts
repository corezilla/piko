/**
 * Case ID: UT-BOOT-178  ·  STATUS: real
 *
 * 责任：参数 `root: string` 的 `超长` 类（main.ts:16）
 * 维度坐标：`runControlProcess` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-178.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-178 · runControlProcess · 字符串/路径/枚举输入 × 超长", () => {
  it("rejects an over-long root", async () => {
    // 步骤 1：构造真实的 configPath 与超长 root
    const root = "r".repeat(4096);

    // 步骤 2：调用 runControlProcess(configPath, root)
    // 步骤 3：断言被拒绝
    await expect(runControlProcess(join(ROOT, "config/runtime.json"), root)).rejects.toThrow();
  });
});
