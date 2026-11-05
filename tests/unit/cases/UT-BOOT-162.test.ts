/**
 * Case ID: UT-BOOT-162  ·  STATUS: real
 *
 * 责任：参数 `source: string` 的 `注入字符` 类（durable-fs.ts:98）
 * 维度坐标：`renameFile` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-162.md（脚本的唯一依据）
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

describe("UT-BOOT-162 · renameFile · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected source path as a path, not a command", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：写一个真实源文件
      await writeFile(join(dir, "src.txt"), "data", "utf8");

      // 步骤 2：调用 renameFile("src.txt", "dst.txt; touch pwned.txt", context)
      // 步骤 3：断言只是普通改名，未执行命令
      const result = await env.renameFile("src.txt", "dst.txt; touch pwned.txt", context);
      expect(result.ok).toBe(true);
      const entries = await readdir(dir);
      expect(entries).toContain("dst.txt; touch pwned.txt");
      expect(entries).not.toContain("pwned.txt");
    });
  });
});
