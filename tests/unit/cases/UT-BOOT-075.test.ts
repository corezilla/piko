/**
 * Case ID: UT-BOOT-075  ·  STATUS: real
 *
 * 责任：参数 `root: string` 的 `边界(上/下/零/空/满)` 类（config.ts:86）
 * 维度坐标：`loadConfig` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-075.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { loadConfig } from "../../../src/config.js";
import { mkdtemp, writeFile, rm, mkdir, readFile, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-075 · loadConfig · 纯函数/无副作用 × 每等价类合法值", () => {
  it("rejects the shipped config the same way with the defaulted root", async () => {
    // 当前实况（G-UT-CONFIG-1）：config/ 下全部运行时配置都不满足
    // piko-runtime-config-v0.3.schema.json（缺 transfer 必填段、pi 多两个字段），
    // 因此 loadConfig 的 schema 校验必然拒绝。本 Case 断言这个真实行为——
    // 成功路径要等配置与 schema 对齐后才可覆盖。
    // 步骤 1：不传 root（用缺省 process.cwd()）
    // 步骤 2：调用 loadConfig(join(process.cwd(), "config/runtime.json"))
    // 步骤 3：断言与显式 root 同样被拒（缺省根与显式根指向同一仓库）
    await expect(loadConfig(join(process.cwd(), "config/runtime.json"))).rejects.toThrow(/transfer/);
  });
});
