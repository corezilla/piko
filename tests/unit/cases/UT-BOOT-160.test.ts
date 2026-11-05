/**
 * Case ID: UT-BOOT-160  ·  STATUS: real
 *
 * 责任：参数 `source: string` 的 `空` 类（durable-fs.ts:98）
 * 维度坐标：`renameFile` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-160.md（脚本的唯一依据）
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

describe("UT-BOOT-160 · renameFile · 字符串/路径/枚举输入 × 空", () => {
  it("rejects an empty source path", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造空 source
      // 步骤 2：调用 renameFile("", "dst.txt", context)
      // 步骤 3：断言返回失败（源不存在）
      const result = await env.renameFile("", "dst.txt", context);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBeDefined();
    });
  });
});
