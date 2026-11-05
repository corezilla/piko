/**
 * Case ID: UT-BOOT-113  ·  STATUS: real
 *
 * 责任：参数 `command: string` 的 `注入字符` 类（durable-fs.ts:25）
 * 维度坐标：`exec` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-113.md（脚本的唯一依据）
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

describe("UT-BOOT-113 · exec · 字符串/路径/枚举输入 × 注入字符", () => {
  it("passes an injected command to the shell verbatim (the shell is the boundary)", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造注入形态的命令——它就是要被执行的命令，不做二次解释
      const command = "echo '$(whoami)'";

      // 步骤 2：调用 exec(command, undefined, context)
      // 步骤 3：断言命令原样进入 shell，输出被捕获
      const result = await env.exec(command, undefined, context);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.exitCode).toBe(0);
      expect(env.executionFacts.list()[0].command).toBe(command);
    });
  });
});
