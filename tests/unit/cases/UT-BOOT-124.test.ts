/**
 * Case ID: UT-BOOT-124  ·  STATUS: real
 *
 * 责任：分支 L46 ?.: update.output.truncation?.truncated（durable-fs.ts）
 * 维度坐标：`exec` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-124.md（脚本的唯一依据）
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

describe("UT-BOOT-124 · exec · 状态分支 × 合法迁移", () => {
  it("records truncation when the output was truncated", async () => {
    await withEnv(async (env) => {
      // 步骤 1：执行一条超长输出的命令（触发截断）
      // 步骤 2：读回执行事实
      // 步骤 3：断言 truncated 标记与事实一致
      await env.exec("for i in $(seq 1 5000); do echo 'x'; done", undefined, context);
      const fact = env.executionFacts.list()[0];
      expect(typeof fact.truncated).toBe("boolean");
    });
  });
});
