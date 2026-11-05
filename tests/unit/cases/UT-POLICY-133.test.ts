/**
 * Case ID: UT-POLICY-133  ·  STATUS: real
 *
 * 责任：资源 L36 readFile（workspace.ts）
 * 维度坐标：`collectOutputs` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-133.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { authorizePath, collectOutputs, ensureTaskDirs } from "../../../src/workspace.js";
import type { TaskRequest } from "../../../src/types.js";

const task = (over: Partial<TaskRequest> = {}): TaskRequest => ({
  task_id: "t-1",
  instruction: "do it",
  workspace_ref: "piko",
  permissions: { read_paths: ["src"], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: ["out/result.txt"],
  ...over,
} as TaskRequest);

async function withWorkspace<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const { mkdtemp, rm, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const dir = await mkdtemp(join(tmpdir(), "piko-ws-"));
  await mkdir(join(dir, "src"), { recursive: true });
  await mkdir(join(dir, "out"), { recursive: true });
  await writeFile(join(dir, "src", "a.txt"), "source", "utf8");
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

describe("UT-POLICY-133 · collectOutputs · 资源获取/释放 × 获取失败路径", () => {
  it("releases the file handle after reading", async () => {
    await withWorkspace(async (dir) => {
      const { writeFile } = await import("node:fs/promises");
      const { join } = await import("node:path");
      await writeFile(join(dir, "out", "r.txt"), "content", "utf8");

      // 步骤 1：构造一个存在的输出
      const t = task({ output_paths: ["out/r.txt"] });

      // 步骤 2：调用 collectOutputs（readFile 打开并关闭句柄）
      const outputs = await collectOutputs(t, dir);

      // 步骤 3：断言内容读到了，且能再次读同一文件（没有句柄泄漏）
      expect(outputs[0].size_bytes).toBe(7);
      const again = await collectOutputs(t, dir);
      expect(again[0].sha256).toBe(outputs[0].sha256);
    });
  });
});
