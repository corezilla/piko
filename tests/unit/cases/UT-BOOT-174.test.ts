/**
 * Case ID: UT-BOOT-174  ·  STATUS: real
 *
 * 责任：参数 `configPath: string` 的 `空` 类（main.ts:16）
 * 维度坐标：`runControlProcess` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-174.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { runControlProcess, main } from "../../../src/main.js";
import { join, resolve } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-174 · runControlProcess · 字符串/路径/枚举输入 × 空", () => {
  it("rejects an empty config path", async () => {
    // 步骤 1：构造 configPath＝""
    // 步骤 2：调用 runControlProcess("", ROOT)
    // 步骤 3：断言被拒绝（读不到配置）
    await expect(runControlProcess("", ROOT)).rejects.toThrow();
  });
});
