/**
 * Case ID: UT-BOOT-096  ·  STATUS: real
 *
 * 责任：参数 `path: string` 的 `超长` 类（durable-fs.ts:20）
 * 维度坐标：`absolute` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-096.md（脚本的唯一依据）
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

describe("UT-BOOT-096 · absolute · 字符串/路径/枚举输入 × 超长", () => {
  it("resolves an over-long relative path against the cwd", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造 1000 段的长路径
      const path = Array.from({ length: 1000 }, (_, i) => `p${i}`).join("/");

      // 步骤 2：调用 private absolute(path)
      // 步骤 3：断言返回以 cwd 为前缀的绝对路径
      const absolute = (env as unknown as { absolute(path: string): string }).absolute.bind(env);
      expect(absolute(path).startsWith(resolve(dir))).toBe(true);
    });
  });
});
