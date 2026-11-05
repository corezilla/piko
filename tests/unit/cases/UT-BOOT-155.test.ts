/**
 * Case ID: UT-BOOT-155  ·  STATUS: real
 *
 * 责任：参数 `context: Context` 的 `非法值` 类（durable-fs.ts:93）
 * 维度坐标：`appendFile` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-155.md（脚本的唯一依据）
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

describe("UT-BOOT-155 · appendFile · 纯函数/无副作用 × 每等价类合法值", () => {
  it("does not append when the context is already aborted", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造一个已 abort 的 signal
      const controller = new AbortController();
      controller.abort();

      // 步骤 2：调用 appendFile("f.txt", "data", { abortSignal: controller.signal })
      // 步骤 3：断言被拒且文件未落盘
      const result = await env.appendFile("f.txt", "data", { abortSignal: controller.signal } as never);
      expect(result.ok).toBe(false);
      expect(await readdir(dir)).not.toContain("f.txt");
    });
  });
});
