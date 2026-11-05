/**
 * Case ID: UT-BOOT-136  ·  STATUS: real
 *
 * 责任：参数 `content: string|Uint8Array` 的 `空` 类（durable-fs.ts:88）
 * 维度坐标：`writeFile` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-136.md（脚本的唯一依据）
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

describe("UT-BOOT-136 · writeFile · 字符串/路径/枚举输入 × 空", () => {
  it("writes an empty content", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造空内容
      // 步骤 2：调用 writeFile("a.txt", "", context)
      // 步骤 3：断言成功且文件为空
      const result = await env.writeFile("a.txt", "", context);
      expect(result.ok).toBe(true);
      expect(await readFile(join(dir, "a.txt"), "utf8")).toBe("");
    });
  });
});
