/**
 * Case ID: UT-BOOT-020  ·  STATUS: real
 *
 * 责任：返回站点 L140 值 （config.ts）
 * 维度坐标：`resolveSecret` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-020.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { resolveSecret } from "../../../src/config.js";

describe("UT-BOOT-020 · resolveSecret · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the file content trimmed", async () => {
    // 步骤 1：写一个带空白的文件
    const { mkdtemp, writeFile, rm } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = await mkdtemp(join(tmpdir(), "piko-secret-"));
    const file = join(dir, "s.txt");
    await writeFile(file, "\n  value  \n\n", "utf8");
    try {
      // 步骤 2：调用 resolveSecret(`file:${file}`)
      const value = await resolveSecret(`file:${file}`);
      // 步骤 3：断言返回值逐值对账（file 分支 trim）
      expect(value).toBe("value");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
