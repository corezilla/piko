/**
 * Case ID: UT-BOOT-016  ·  STATUS: real
 *
 * 责任：分支 L140 if: if (kind === "file")（config.ts）
 * 维度坐标：`resolveSecret` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-016.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { resolveSecret } from "../../../src/config.js";

describe("UT-BOOT-016 · resolveSecret · 状态分支 × 合法迁移", () => {
  it("resolves a file: reference by reading the file", async () => {
    // 步骤 1：在临时目录写一个 secret 文件
    const { mkdtemp, writeFile, rm } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = await mkdtemp(join(tmpdir(), "piko-secret-"));
    const file = join(dir, "secret.txt");
    await writeFile(file, "  file-secret\n", "utf8");
    try {
      // 步骤 2：调用 resolveSecret(`file:${file}`)
      // 步骤 3：断言返回值逐值等于文件内容（已 trim）
      await expect(resolveSecret(`file:${file}`)).resolves.toBe("file-secret");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
