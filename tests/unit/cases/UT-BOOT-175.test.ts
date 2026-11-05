/**
 * Case ID: UT-BOOT-175  ·  STATUS: real
 *
 * 责任：参数 `configPath: string` 的 `超长` 类（main.ts:16）
 * 维度坐标：`runControlProcess` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-175.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-175 · runControlProcess · 字符串/路径/枚举输入 × 超长", () => {
  it("rejects an over-long config path", async () => {
    // 步骤 1：构造 1000 字符的 configPath
    const configPath = "x".repeat(1000);

    // 步骤 2：调用 runControlProcess(configPath, ROOT)
    // 步骤 3：断言被拒绝
    await expect(runControlProcess(configPath, ROOT)).rejects.toThrow();
  });
});
