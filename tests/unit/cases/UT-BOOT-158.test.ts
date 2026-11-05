/**
 * Case ID: UT-BOOT-158  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #2（appendFile 的 await 目标拒绝必须 typed 化上抛；durable-fs.ts:93）
 * 维度坐标：`appendFile` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-158.md（脚本的唯一依据）
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

describe("UT-BOOT-158 · appendFile · 错误路径 × 每个 typed 错误码", () => {
  it("returns a typed error instead of throwing", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造一个会失败的追加（目标是已存在的目录）
      await (await import("node:fs/promises")).mkdir(join(dir, "adir"), { recursive: true });

      // 步骤 2：调用 appendFile("adir", "data", context)
      // 步骤 3：断言返回失败（不是抛出）
      const result = await env.appendFile("adir", "data", context);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBeDefined();
    });
  });
});
