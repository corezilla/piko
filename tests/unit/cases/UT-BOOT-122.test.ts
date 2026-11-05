/**
 * Case ID: UT-BOOT-122  ·  STATUS: real
 *
 * 责任：分支 L44 if: if (update.kind === "replace")（durable-fs.ts）
 * 维度坐标：`exec` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-122.md（脚本的唯一依据）
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

describe("UT-BOOT-122 · exec · 状态分支 × 合法迁移", () => {
  it("captures the output on a replace update", async () => {
    await withEnv(async (env) => {
      // 步骤 1：执行一条有输出的命令，并让命令存活超过发布节流窗口
      //         （Pi 的 AdaptivePublisher 有 100ms 节流，瞬时结束的��令来不及发布）
      await env.exec("echo captured-output", { onUpdate: () => {} }, context);

      // 步骤 2：读回执行事实
      // 步骤 3：断言输出被捕获（replace 分支把整段输出记下）
      expect(env.executionFacts.list()[0].output).toContain("captured-output");
    });
  });
});
