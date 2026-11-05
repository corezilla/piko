/**
 * Case ID: UT-BOOT-118  ·  STATUS: real
 *
 * 责任：参数 `context` 的 `边界(上/下/零/空/满)` 类（durable-fs.ts:25）
 * 维度坐标：`exec` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-118.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DurableNodeExecutionEnv } from "../../../src/durable-fs.js";

const context = { abortSignal: undefined, signal: undefined } as never;

async function withEnv<T>(fn: (env: DurableNodeExecutionEnv, dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "piko-durable-"));
  try {
    return await fn(new DurableNodeExecutionEnv({ cwd: dir }), dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

describe("UT-BOOT-118 · exec · 纯函数/无副作用 × 每等价类合法值", () => {
  it("execs when the abort signal is not aborted", async () => {
    await withEnv(async (env) => {
      // 步骤 1：构造一个未 abort 的 signal
      const controller = new AbortController();

      // 步骤 2：调用 exec("echo hi", undefined, { abortSignal: controller.signal })
      // 步骤 3：断言成功
      const result = await env.exec("echo hi", undefined, { abortSignal: controller.signal } as never);
      expect(result.ok).toBe(true);
    });
  });
});
