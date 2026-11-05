/**
 * Case ID: UT-BOOT-076  ·  STATUS: real
 *
 * 责任：参数 `root: string` 的 `非法值` 类（config.ts:86）
 * 维度坐标：`loadConfig` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-076.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { loadConfig } from "../../../src/config.js";
import { mkdtemp, writeFile, rm, mkdir, readFile, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();

describe("UT-BOOT-076 · loadConfig · 纯函数/无副作用 × 每等价类合法值", () => {
  it("rejects a root that does not hold the schema", async () => {
    // 步骤 1：构造一个空目录作为 root（schema 不在其中）
    const dir = await mkdtemp(join(tmpdir(), "piko-emptyroot-"));
    try {
      // 步骤 2：调用 loadConfig(真实 config 路径, 空目录作 root)
      // 步骤 3：断言被拒绝（schema 读不到）
      await expect(loadConfig(join(ROOT, "config/runtime.json"), dir)).rejects.toThrow();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
