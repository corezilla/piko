/**
 * Case ID: UT-BOOT-148  ·  STATUS: real
 *
 * 责任：参数 `path: string` 的 `超长` 类（durable-fs.ts:93）
 * 维度坐标：`appendFile` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `BOOT`）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-148.md（脚本的唯一依据）
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

describe("UT-BOOT-148 · appendFile · 字符串/路径/枚举输入 × 超长", () => {
  it("appends to a deeply nested path", async () => {
    await withEnv(async (env, dir) => {
      // 步骤 1：构造 50 段的深路径
      const path = Array.from({ length: 50 }, (_, i) => `d${i}`).join("/");

      // 步骤 2：调用 appendFile(path, "data", context)
      // 步骤 3：断言成功且内容落盘
      const result = await env.appendFile(path, "data", context);
      expect(result.ok).toBe(true);
      expect(await readFile(join(dir, path), "utf8")).toBe("data");
    });
  });
});
