/**
 * Case ID: UT-BOOT-133  ·  STATUS: real
 *
 * 责任：参数 `path: string` 的 `空` 类（durable-fs.ts:88）
 * 维度坐标：`writeFile` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-133.md（脚本的唯一依据）
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

describe("UT-BOOT-133 · writeFile · 字符串/路径/枚举输入 × 空", () => {
  it("writes to the cwd when the path is empty — rejected as a directory", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造空路径
      // 步骤 2：调用 writeFile("", "data", context)
      // 步骤 3：断言返回失败——resolve(cwd, "") 落到 cwd 本身，
      // 把目录当文件写会被文件系统拒绝（EISDIR）；该参数无格式校验
      const result = await env.writeFile("", "data", context);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBeDefined();
      expect(await readdir(dir)).toEqual([]);
    });
  });
});
