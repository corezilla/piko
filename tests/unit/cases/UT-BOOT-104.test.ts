/**
 * Case ID: UT-BOOT-104  ·  STATUS: real
 *
 * 责任：参数 `directory: boolean` 的 `边界(上/下/零/空/满)` 类（durable-fs.ts:21）
 * 维度坐标：`sync` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-104.md（脚本的唯一依据）
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

describe("UT-BOOT-104 · sync · 纯函数/无副作用 × 每等价类合法值", () => {
  it("syncs the parent directory when directory is true", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：在 cwd 下写一个文件
      const file = join(dir, "b.txt");
      await writeFile(file, "data", "utf8");

      // 步骤 2：调用 private sync(file, true) —— 取 dirname
      // 步骤 3：断言成功返回（目录项也被 fsync）
      const sync = (env as unknown as { sync(path: string, directory?: boolean): Promise<void> }).sync.bind(env);
      await expect(sync(file, true)).resolves.toBeUndefined();
    });
  });
});
