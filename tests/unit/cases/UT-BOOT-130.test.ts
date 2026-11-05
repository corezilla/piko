/**
 * Case ID: UT-BOOT-130  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #1（exec 的 await 目标拒绝必须 typed 化上抛；durable-fs.ts:25）
 * 维度坐标：`exec` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-130.md（脚本的唯一依据）
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

describe("UT-BOOT-130 · exec · 错误路径 × 每个 typed 错误码", () => {
  it("returns a typed error when the working directory does not exist", async () => {
    await withEnv(async (env) => {
      // 步骤 1：构造一个不存在的 cwd
      const options = { cwd: "/definitely/not/here" };

      // 步骤 2：调用 exec("echo hi", options, context)
      // 步骤 3：断言返回失败且错误码逐值等于 spawn_error
      const result = await env.exec("echo hi", options as never, context);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("spawn_error");
    });
  });
});
