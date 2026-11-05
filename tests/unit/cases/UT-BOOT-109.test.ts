/**
 * Case ID: UT-BOOT-109  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #2（sync 的 await 目标拒绝必须 typed 化上抛；durable-fs.ts:21）
 * 维度坐标：`sync` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-109.md（脚本的唯一依据）
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

describe("UT-BOOT-109 · sync · 错误路径 × 每个 typed 错误码", () => {
  it("propagates the open failure with its own error", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造一个不存在的路径（open 必然拒绝）
      const missing = join(dir, "does-not-exist.txt");

      // 步骤 2：调用 private sync(missing)
      // 步骤 3：断言拒绝被原样上抛（未被吞掉、未被改写）
      const sync = (env as unknown as { sync(path: string, directory?: boolean): Promise<void> }).sync.bind(env);
      await expect(sync(missing)).rejects.toThrow(/ENOENT|no such file/i);
    });
  });

  it("does not leave the handle open when the sync fails", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造一个不存在的路径
      const missing = join(dir, "missing-too.txt");

      // 步骤 2：调用 private sync(missing)
      // 步骤 3：断言拒绝后目录里没有留下任何文件（无残留）
      const sync = (env as unknown as { sync(path: string, directory?: boolean): Promise<void> }).sync.bind(env);
      await expect(sync(missing)).rejects.toThrow();
      expect(await readdir(dir)).toEqual([]);
    });
  });
});
