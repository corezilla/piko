/**
 * Case ID: UT-BOOT-099  ·  STATUS: real
 *
 * 责任：返回站点 L20 值 （durable-fs.ts）
 * 维度坐标：`absolute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-099.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { mkdtemp, rm, readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
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

describe("UT-BOOT-099 · absolute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns an absolute path in both branches", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造相对与绝对两条输入
      const absolute = (env as unknown as { absolute(path: string): string }).absolute.bind(env);

      // 步骤 2：分别调用
      const relative = absolute("x.txt");
      const absolutePath = absolute(resolve("/tmp"));

      // 步骤 3：断言两条都是绝对路径
      expect(relative.startsWith("/")).toBe(true);
      expect(absolutePath.startsWith("/")).toBe(true);
      expect(relative.startsWith(resolve(dir))).toBe(true);
    });
  });
});
