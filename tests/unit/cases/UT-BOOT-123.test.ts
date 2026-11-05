/**
 * Case ID: UT-BOOT-123  ·  STATUS: real
 *
 * 责任：分支 L47 else: if (update.kind === "append")（durable-fs.ts）
 * 维度坐标：`exec` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-123.md（脚本的唯一依据）
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

describe("UT-BOOT-123 · exec · 状态分支 × 合法迁移", () => {
  it("accumulates output across updates", async () => {
    await withEnv(async (env) => {
      // 步骤 1：执行一条多行输出的命令
      // 步骤 2：读回执行事实
      // 步骤 3：断言各段输出都在（append 分支累加，不覆盖）
      await env.exec("printf 'a\\nb\\n'", { onUpdate: () => {} }, context);
      const output = env.executionFacts.list()[0].output;
      expect(output).toContain("a");
      expect(output).toContain("b");
    });
  });
});
