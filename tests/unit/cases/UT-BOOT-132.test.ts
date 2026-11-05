/**
 * Case ID: UT-BOOT-132  ·  STATUS: real
 *
 * 责任：返回站点 L86 值 （durable-fs.ts）
 * 维度坐标：`exec` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-132.md（脚本的唯一依据）
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

describe("UT-BOOT-132 · exec · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the shell result unchanged", async () => {
    await withEnv(async (env) => {
      // 步骤 1：执行一条成功命令
      // 步骤 2：读回返回值
      // 步骤 3：断言退出码逐值对账（exec 的返回值原样透传，未被事实收集改写）
      const result = await env.exec("exit 0", undefined, context);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.exitCode).toBe(0);
    });
  });
});
