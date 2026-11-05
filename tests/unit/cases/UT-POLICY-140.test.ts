/**
 * Case ID: UT-POLICY-140  ·  STATUS: real
 *
 * 责任：参数 `task` 的 `非法值` 类（workspace.ts:41）
 * 维度坐标：`ensureTaskDirs` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-140.md（脚本的唯一依据）
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

describe("UT-POLICY-140 · ensureTaskDirs · 纯函数/无副作用 × 每等价类合法值", () => {
  it("does not create a directory outside the workspace", async () => {
    await withWorkspace(async (dir) => {
      const { stat } = await import("node:fs/promises");
      const { join } = await import("node:path");

      // 步骤 1：构造一个逃出工作区的写路径
      const t = task({ permissions: { read_paths: ["src"], write_paths: ["../escape"], tool_profile_ref: "workspace-standard" }, output_paths: [] });

      // 步骤 2：调用 ensureTaskDirs
      await ensureTaskDirs(dir, t);

      // 步骤 3：断言工作区外没有被创建目录
      await expect(stat(join(dir, "..", "escape"))).rejects.toThrow();
    });
  });
});
