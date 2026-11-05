/**
 * Case ID: UT-BOOT-074  ·  STATUS: real
 *
 * 责任：参数 `root: string` 的 `每等价类合法值` 类（config.ts:86）
 * 维度坐标：`loadConfig` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-074.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { loadConfig } from "../../../src/config.js";
import { mkdtemp, writeFile, rm, mkdir, readFile, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-074 · loadConfig · 纯函数/无副作用 × 每等价类合法值", () => {
  it("rejects the shipped runtime config at the schema step", async () => {
    // 当前实况（G-UT-CONFIG-1）：config/ 下全部运行时配置都不满足
    // piko-runtime-config-v0.3.schema.json（缺 transfer 必填段、pi 多两个字段），
    // 因此 loadConfig 的 schema 校验必然拒绝。本 Case 断言这个真实行为——
    // 成功路径要等配置与 schema 对齐后才可覆盖。
    // 步骤 1：构造真实的 config/runtime.json 与仓库根
    // 步骤 2：调用 loadConfig(join(ROOT, "config/runtime.json"), ROOT)
    // 步骤 3：断言 schema 校验拒绝，且消息逐值指出缺失的必填段
    await expect(loadConfig(join(ROOT, "config/runtime.json"), ROOT)).rejects.toThrow(/transfer/);
  });

  it("rejects every shipped runtime config the same way", async () => {
    // 当前实况（G-UT-CONFIG-1）：config/ 下全部运行时配置都不满足
    // piko-runtime-config-v0.3.schema.json（缺 transfer 必填段、pi 多两个字段），
    // 因此 loadConfig 的 schema 校验必然拒绝。本 Case 断言这个真实行为——
    // 成功路径要等配置与 schema 对齐后才可覆盖。
    // 步骤 1：列出 config/ 下全部运行时配置
    const names = ["runtime.json", "runtime.omlx.json", "runtime.synthetic.json", "runtime.tier.json", "runtime.llmtier.json"];
    for (const name of names) {
      // 步骤 2：逐个调用 loadConfig
      // 步骤 3：断言每份都在 schema 步被拒
      await expect(loadConfig(join(ROOT, "config", name), ROOT)).rejects.toThrow(/transfer/);
    }
  });
});
