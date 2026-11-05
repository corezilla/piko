/**
 * Case ID: UT-BOOT-140  ·  STATUS: real
 *
 * 责任：参数 `context: Context` 的 `边界(上/下/零/空/满)` 类（durable-fs.ts:88）
 * 维度坐标：`writeFile` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-140.md（脚本的唯一依据）
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

describe("UT-BOOT-140 · writeFile · 纯函数/无副作用 × 每等价类合法值", () => {
  it("writes when the abort signal is not aborted", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造一个未 abort 的 signal
      const controller = new AbortController();

      // 步骤 2：调用 writeFile("e.txt", "data", { abortSignal: controller.signal })
      // 步骤 3：断言成功（未 abort 不阻断）
      const result = await env.writeFile("e.txt", "data", { abortSignal: controller.signal } as never);
      expect(result.ok).toBe(true);
      expect(await readFile(join(dir, "e.txt"), "utf8")).toBe("data");
    });
  });
});
