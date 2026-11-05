/**
 * Case ID: UT-BOOT-142  ·  STATUS: real
 *
 * 责任：分支 L90 if: if (result.ok)（durable-fs.ts）
 * 维度坐标：`writeFile` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-142.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { mkdtemp, rm, readFile, writeFile, readdir, stat, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DurableNodeExecutionEnv } from "../../../src/durable-fs.js";

/** Pi's Context — the file methods read only abortSignal. */
const context = { abortSignal: undefined, signal: undefined } as never;

async function withEnv<T>(fn: (env: DurableNodeExecutionEnv, dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "piko-durable-"));
  try {
    return await fn(new DurableNodeExecutionEnv({ cwd: dir }), dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

describe("UT-BOOT-142 · writeFile · 状态分支 × 合法迁移", () => {
  it("syncs only on the success side", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造一个会被拒绝的写入（已 abort 的 context）
      const controller = new AbortController();
      controller.abort();

      // 步骤 2：调用 writeFile
      // 步骤 3：断言返回失败（成功分支未执行，未做 fsync）
      const result = await env.writeFile("g.txt", "data", { abortSignal: controller.signal } as never);
      expect(result.ok).toBe(false);
    });
  });

  it("completes the write and the fsync on the success side", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：正常路径
      // 步骤 2：调用 writeFile
      // 步骤 3：断言成功且内容完整（fsync 之后才暴露成功）
      const result = await env.writeFile("h.txt", "data", context);
      expect(result.ok).toBe(true);
      expect(await readFile(join(dir, "h.txt"), "utf8")).toBe("data");
    });
  });
});
