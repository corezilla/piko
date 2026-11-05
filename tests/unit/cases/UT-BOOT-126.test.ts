/**
 * Case ID: UT-BOOT-126  ·  STATUS: real
 *
 * 责任：分支 L59 if: if (result.ok)（durable-fs.ts）
 * 维度坐标：`exec` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-126.md（脚本的唯一依据）
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

describe("UT-BOOT-126 · exec · 状态分支 × 合法迁移", () => {
  it("records an exited fact for a successful command", async () => {
    await withEnv(async (env) => {
      // 步骤 1：执行一条成功命令
      // 步骤 2：读回执行事实
      // 步骤 3：断言 status＝exited、exit_code＝0
      await env.exec("true", undefined, context);
      const fact = env.executionFacts.list()[0];
      expect(fact.status).toBe("exited");
      expect(fact.exit_code).toBe(0);
    });
  });
});
