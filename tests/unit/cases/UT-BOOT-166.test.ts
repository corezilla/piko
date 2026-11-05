/**
 * Case ID: UT-BOOT-166  ·  STATUS: real
 *
 * 责任：参数 `context: Context` 的 `每等价类合法值` 类（durable-fs.ts:98）
 * 维度坐标：`renameFile` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-166.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { mkdtemp, rm, readFile, writeFile, readdir } from "node:fs/promises";
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

describe("UT-BOOT-166 · renameFile · 纯函数/无副作用 × 每等价类合法值", () => {
  it("renames when the context carries no abort signal", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：写一个真实源文件
      await writeFile(join(dir, "src.txt"), "data", "utf8");

      // 步骤 2：调用 renameFile("src.txt", "dst.txt", context)
      // 步骤 3：断言成功且文件已改名
      const result = await env.renameFile("src.txt", "dst.txt", context);
      expect(result.ok).toBe(true);
      expect(await readFile(join(dir, "dst.txt"), "utf8")).toBe("data");
      expect(await readdir(dir)).not.toContain("src.txt");
    });
  });
});
