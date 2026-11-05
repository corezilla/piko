/**
 * Case ID: UT-BOOT-121  ·  STATUS: real
 *
 * 责任：分支 L40 ternary: ? options :（durable-fs.ts）
 * 维度坐标：`exec` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-121.md（脚本的唯一依据）
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

describe("UT-BOOT-121 · exec · 状态分支 × 合法迁移", () => {
  it("builds tapped options when options exist", async () => {
    await withEnv(async (env) => {
      // 步骤 1：构造带 onUpdate 的 options
      let called = 0;
      const options = { onUpdate: () => { called += 1; } };

      // 步骤 2：调用 exec
      // 步骤 3：断言 tappedOptions 生效——调用方回调仍被调用
      await env.exec("echo hi", options as never, context);
      expect(called).toBeGreaterThan(0);
    });
  });

  it("passes undefined options through when there are none", async () => {
    await withEnv(async (env) => {
      // 步骤 1：不传 options（走 ternary 的 false 侧）
      // 步骤 2：调用 exec
      // 步骤 3：断言成功
      const result = await env.exec("echo hi", undefined, context);
      expect(result.ok).toBe(true);
    });
  });
});
