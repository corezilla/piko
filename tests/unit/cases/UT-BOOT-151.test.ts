/**
 * Case ID: UT-BOOT-151  ·  STATUS: real
 *
 * 责任：参数 `content: string|Uint8Array` 的 `超长` 类（durable-fs.ts:93）
 * 维度坐标：`appendFile` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-151.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { mkdtemp, rm, readFile, writeFile, readdir, stat, chmod } from "node:fs/promises";
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

describe("UT-BOOT-151 · appendFile · 字符串/路径/枚举输入 × 超长", () => {
  it("appends a large content", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造 1 MiB 内容
      const content = "y".repeat(1024 * 1024);

      // 步骤 2：调用 appendFile("big.txt", content, context)
      // 步骤 3：断言成功且长度逐值对账
      const result = await env.appendFile("big.txt", content, context);
      expect(result.ok).toBe(true);
      expect((await stat(join(dir, "big.txt"))).size).toBe(content.length);
    });
  });
});
