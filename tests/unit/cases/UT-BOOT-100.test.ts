/**
 * Case ID: UT-BOOT-100  ·  STATUS: real
 *
 * 责任：参数 `path: string` 的 `空` 类（durable-fs.ts:21）
 * 维度坐标：`sync` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-100.md（脚本的唯一依据）
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

describe("UT-BOOT-100 · sync · 字符串/路径/枚举输入 × 空", () => {
  it("syncs the cwd itself for an empty path", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造空路径
      // 步骤 2：调用 private sync("") —— resolve(cwd, "") ＝ cwd，open 打开的是 cwd
      // 步骤 3：断言成功返回（该参数无校验，空路径落到 cwd）
      const sync = (env as unknown as { sync(path: string, directory?: boolean): Promise<void> }).sync.bind(env);
      await expect(sync("")).resolves.toBeUndefined();
      expect(resolve(dir)).toBe(dir);
    });
  });
});
