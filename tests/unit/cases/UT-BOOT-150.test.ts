/**
 * Case ID: UT-BOOT-150  ·  STATUS: real
 *
 * 责任：参数 `content: string|Uint8Array` 的 `空` 类（durable-fs.ts:93）
 * 维度坐标：`appendFile` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-150.md（脚本的唯一依据）
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

describe("UT-BOOT-150 · appendFile · 字符串/路径/枚举输入 × 空", () => {
  it("appends an empty content without changing the file", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：先写一个文件
      await writeFile(join(dir, "a.txt"), "keep", "utf8");

      // 步骤 2：调用 appendFile("a.txt", "", context)
      // 步骤 3：断言成功且原内容不变
      const result = await env.appendFile("a.txt", "", context);
      expect(result.ok).toBe(true);
      expect(await readFile(join(dir, "a.txt"), "utf8")).toBe("keep");
    });
  });
});
