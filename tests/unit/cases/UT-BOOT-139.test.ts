/**
 * Case ID: UT-BOOT-139  ·  STATUS: real
 *
 * 责任：参数 `context: Context` 的 `每等价类合法值` 类（durable-fs.ts:88）
 * 维度坐标：`writeFile` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-139.md（脚本的唯一依据）
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

describe("UT-BOOT-139 · writeFile · 纯函数/无副作用 × 每等价类合法值", () => {
  it("writes when the context carries no abort signal", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造无 abortSignal 的 Context
      // 步骤 2：调用 writeFile("d.txt", "data", context)
      // 步骤 3：断言成功
      const result = await env.writeFile("d.txt", "data", context);
      expect(result.ok).toBe(true);
      expect(await readFile(join(dir, "d.txt"), "utf8")).toBe("data");
    });
  });
});
