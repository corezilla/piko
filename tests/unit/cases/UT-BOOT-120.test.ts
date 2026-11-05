/**
 * Case ID: UT-BOOT-120  ·  STATUS: real
 *
 * 责任：分支 L39 ?.: options?.onUpdate（durable-fs.ts）
 * 维度坐标：`exec` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-120.md（脚本的唯一依据）
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

describe("UT-BOOT-120 · exec · 状态分支 × 合法迁移", () => {
  it("invokes the caller's onUpdate when one is given", async () => {
    await withEnv(async (env) => {
      // 步骤 1：构造一个记录调用的 onUpdate
      let called = 0;
      const options = { onUpdate: () => { called += 1; } };

      // 步骤 2：调用 exec("echo hi", options, context)
      // 步骤 3：断言调用方的回调被调用（原样透传，未被替换）
      await env.exec("echo hi", options as never, context);
      expect(called).toBeGreaterThan(0);
    });
  });

  it("does not fail when there is no onUpdate to call", async () => {
    await withEnv(async (env) => {
      // 步骤 1：不传 options（可选链取 undefined）
      // 步骤 2：调用 exec
      // 步骤 3：断言成功（可选链短路，不调用任何回调）
      const result = await env.exec("echo hi", undefined, context);
      expect(result.ok).toBe(true);
    });
  });
});
