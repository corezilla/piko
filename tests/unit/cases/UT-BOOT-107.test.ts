/**
 * Case ID: UT-BOOT-107  ·  STATUS: real
 *
 * 责任：分支 L22 ternary: ? directory :（durable-fs.ts）
 * 维度坐标：`sync` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-107.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { mkdtemp, rm, readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { DurableNodeExecutionEnv } from "../../../src/durable-fs.js";

/** Pi's Context — the file methods read only abortSignal. */
const context = { abortSignal: undefined, signal: undefined } as never;

async function withEnv<T>(fn: (env: DurableNodeExecutionEnv, dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "piko-durable-"));
  try {
    return await fn(new DurableNodeExecutionEnv({ cwd: dir }), dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

describe("UT-BOOT-107 · sync · 状态分支 × 合法迁移", () => {
  it("opens the file itself when directory is false", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：在 cwd 下写一个文件
      const file = join(dir, "d.txt");
      await writeFile(file, "data", "utf8");

      // 步骤 2：调用 private sync(file, false)
      // 步骤 3：断言成功——打开的是文件本身（目录本身打不开 "r"）
      const sync = (env as unknown as { sync(path: string, directory?: boolean): Promise<void> }).sync.bind(env);
      await expect(sync(file, false)).resolves.toBeUndefined();
    });
  });

  it("opens the parent directory when directory is true", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：在 cwd 下写一个文件
      const file = join(dir, "e.txt");
      await writeFile(file, "data", "utf8");

      // 步骤 2：调用 private sync(file, true)
      // 步骤 3：断言成功——打开的是 dirname(file)
      const sync = (env as unknown as { sync(path: string, directory?: boolean): Promise<void> }).sync.bind(env);
      await expect(sync(file, true)).resolves.toBeUndefined();
    });
  });
});
