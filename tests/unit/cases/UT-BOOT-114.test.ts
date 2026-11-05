/**
 * Case ID: UT-BOOT-114  ·  STATUS: real
 *
 * 责任：参数 `options: ShellExecOptions | undefined` 的 `每等价类合法值` 类（durable-fs.ts:25）
 * 维度坐标：`exec` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-114.md（脚本的唯一依据）
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

describe("UT-BOOT-114 · exec · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts options with an onUpdate callback", async () => {
    await withEnv(async (env) => {
      // 步骤 1：构造带 onUpdate 的 options
      const seen: string[] = [];
      const options = { onUpdate: (update: { kind: string; output?: { text: string } }) => {
        if (update.kind === "replace") seen.push(update.output?.text ?? "");
      } };

      // 步骤 2：调用 exec("echo hi", options, context)
      // 步骤 3：断言调用方的 onUpdate 仍被调用（原样透传）
      const result = await env.exec("echo hi", options as never, context);
      expect(result.ok).toBe(true);
      expect(seen.length).toBeGreaterThan(0);
    });
  });
});
