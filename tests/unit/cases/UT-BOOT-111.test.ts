/**
 * Case ID: UT-BOOT-111  ·  STATUS: real
 *
 * 责任：参数 `command: string` 的 `空` 类（durable-fs.ts:25）
 * 维度坐标：`exec` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-111.md（脚本的唯一依据）
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

describe("UT-BOOT-111 · exec · 字符串/路径/枚举输入 × 空", () => {
  it("runs an empty command without crashing", async () => {
    await withEnv(async (env) => {
      // 步骤 1：构造空命令
      // 步骤 2：调用 exec("", undefined, context)
      // 步骤 3：断言返回失败或成功——不抛错，且执行事实被记录
      const result = await env.exec("", undefined, context);
      expect(typeof result.ok).toBe("boolean");
      expect(env.executionFacts.list().length).toBeGreaterThan(0);
    });
  });
});
