/**
 * Case ID: UT-BOOT-098  ·  STATUS: real
 *
 * 责任：分支 L20 ternary: ? isAbsolute(path) :（durable-fs.ts）
 * 维度坐标：`absolute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-098.md（脚本的唯一依据）
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

describe("UT-BOOT-098 · absolute · 状态分支 × 合法迁移", () => {
  it("takes the absolute branch for an absolute path", async () => {
    await withEnv(async (env) => {
      // 步骤 1：构造绝对路径
      const absolutePath = resolve("/tmp");

      // 步骤 2：调用 private absolute(absolutePath)
      // 步骤 3：断言返回该路径本身（不被 cwd 前缀）
      const absolute = (env as unknown as { absolute(path: string): string }).absolute.bind(env);
      expect(absolute(absolutePath)).toBe(resolve(absolutePath));
    });
  });

  it("takes the relative branch for a relative path", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造相对路径
      // 步骤 2：调用 private absolute("sub/file.txt")
      // 步骤 3：断言被拼到 cwd 之下
      const absolute = (env as unknown as { absolute(path: string): string }).absolute.bind(env);
      expect(absolute("sub/file.txt")).toBe(resolve(dir, "sub/file.txt"));
    });
  });
});
