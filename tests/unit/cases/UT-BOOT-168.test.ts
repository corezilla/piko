/**
 * Case ID: UT-BOOT-168  ·  STATUS: real
 *
 * 责任：参数 `context: Context` 的 `非法值` 类（durable-fs.ts:98）
 * 维度坐标：`renameFile` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-168.md（脚本的唯一依据）
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

describe("UT-BOOT-168 · renameFile · 纯函数/无副作用 × 每等价类合法值", () => {
  it("does not rename when the context is already aborted", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造一个已 abort 的 signal 与源文件
      const controller = new AbortController();
      controller.abort();
      await writeFile(join(dir, "src.txt"), "data", "utf8");

      // 步骤 2：调用 renameFile("src.txt", "dst.txt", { abortSignal: controller.signal })
      // 步骤 3：断言被拒且源文件原样保留（无半写）
      const result = await env.renameFile("src.txt", "dst.txt", { abortSignal: controller.signal } as never);
      expect(result.ok).toBe(false);
      expect(await readdir(dir)).toContain("src.txt");
      expect(await readdir(dir)).not.toContain("dst.txt");
    });
  });
});
