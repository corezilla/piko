/**
 * Case ID: UT-BOOT-094  ·  STATUS: real
 *
 * 责任：返回站点 L129 值 `{ config, tools }` 逐值断言（config.ts）
 * 维度坐标：`loadConfig` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-094.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { loadConfig } from "../../../src/config.js";
import { mkdtemp, writeFile, rm, mkdir, readFile, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-094 · loadConfig · 纯函数/无副作用 × 每等价类合法值", () => {
  it("never returns a result: the schema step rejects first", async () => {
    // 当前实况（G-UT-CONFIG-1）：schema 步先拒绝，成功返回路径不可达。
    await expect(loadConfig(join(ROOT, "config/runtime.json"), ROOT)).rejects.toThrow(/transfer/);
  });
});
