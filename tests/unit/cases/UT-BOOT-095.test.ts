/**
 * Case ID: UT-BOOT-095  ·  STATUS: real
 *
 * 责任：参数 `path: string` 的 `空` 类（durable-fs.ts:20）
 * 维度坐标：`absolute` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-095.md（脚本的唯一依据）
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

describe("UT-BOOT-095 · absolute · 字符串/路径/枚举输入 × 空", () => {
  it("resolves an empty path against the cwd", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造空路径
      // 步骤 2：调用 private absolute("")
      // 步骤 3：断言返回 cwd 本身（resolve(cwd, "") ＝ cwd）
      const absolute = (env as unknown as { absolute(path: string): string }).absolute.bind(env);
      expect(absolute("")).toBe(resolve(dir));
    });
  });
});
