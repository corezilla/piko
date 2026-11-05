/**
 * Case ID: UT-BOOT-164  ·  STATUS: real
 *
 * 责任：参数 `destination: string` 的 `超长` 类（durable-fs.ts:98）
 * 维度坐标：`renameFile` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-164.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { mkdtemp, rm, readFile, writeFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

describe("UT-BOOT-164 · renameFile · 字符串/路径/枚举输入 × 超长", () => {
  it("rejects an over-long destination path", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：写一个真实源文件并构造超长 destination
      await writeFile(join(dir, "src.txt"), "data", "utf8");

      // 步骤 2：调用 renameFile("src.txt", "d".repeat(4096), context)
      // 步骤 3：断言返回失败
      const result = await env.renameFile("src.txt", "d".repeat(4096), context);
      expect(result.ok).toBe(false);
    });
  });
});
