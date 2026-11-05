/**
 * Case ID: UT-POLICY-147  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #1：被调方 `mkdir(d, { recursive: true })` 拒绝必须 typed 化上抛（workspace.ts:44）
 * 维度坐标：`ensureTaskDirs` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-147.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ensureTaskDirs, resolveWorkspace } from "../../../src/workspace.js";
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

describe("UT-POLICY-147 · ensureTaskDirs · 错误路径 × 每个 typed 错误码", () => {
  it("propagates a mkdir failure", async () => {
    await withWorkspace(async (dir) => {
      const { writeFile } = await import("node:fs/promises");
      const { join } = await import("node:path");

      // 步骤 1：在目标目录上放一个同名文件——mkdir 会因路径已存在且非目录而失败
      await writeFile(join(dir, "blocked"), "file", "utf8");
      const t = task({
        permissions: { read_paths: ["src"], write_paths: ["blocked/child"], tool_profile_ref: "workspace-standard" },
        output_paths: [],
      });

      // 步骤 2：调用 ensureTaskDirs
      // 步骤 3：断言拒绝被上抛（该方法不吞文件系统错误）
      await expect(ensureTaskDirs(dir, t)).rejects.toThrow();
    });
  });
});
