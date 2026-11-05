/**
 * Case ID: UT-BOOT-112  ·  STATUS: real
 *
 * 责任：参数 `command: string` 的 `超长` 类（durable-fs.ts:25）
 * 维度坐标：`exec` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-112.md（脚本的唯一依据）
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

describe("UT-BOOT-112 · exec · 字符串/路径/枚举输入 × 超长", () => {
  it("runs an over-long command line", async () => {
    await withEnv(async (env) => {
      // 步骤 1：构造 1000 字符的命令
      const command = "echo " + "x".repeat(1000);

      // 步骤 2：调用 exec(command, undefined, context)
      // 步骤 3：断言不抛错，且事实里记的是这条命令
      const result = await env.exec(command, undefined, context);
      expect(typeof result.ok).toBe("boolean");
      expect(env.executionFacts.list()[0].command).toBe(command);
    });
  });
});
