/**
 * Case ID: UT-BOOT-131  ·  STATUS: real
 *
 * 责任：状态写 L55 → db（exec.ts）
 * 维度坐标：`exec` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-131.md（脚本的唯一依据）
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

describe("UT-BOOT-131 · exec · 持久化/序列化 × round-trip", () => {
  it("records the execution fact with its timing fields", async () => {
    await withEnv(async (env) => {
      // 步骤 1：执行一条命令
      await env.exec("echo fact", undefined, context);

      // 步骤 2：读回执行事实
      // 步骤 3：断言时间字段逐值可读（started_at／ended_at 是 ISO，duration_ms 是数）
      const fact = env.executionFacts.list()[0];
      expect(fact.started_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(fact.ended_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(typeof fact.duration_ms).toBe("number");
    });
  });
});
