/**
 * Case ID: UT-POLICY-122  ·  STATUS: real
 *
 * 责任：参数 `task` 的 `边界(上/下/零/空/满)` 类（workspace.ts:32）
 * 维度坐标：`collectOutputs` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-122.md（脚本的唯一依据）
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

describe("UT-POLICY-122 · collectOutputs · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns nothing for a task with no output paths", async () => {
    await withWorkspace(async (dir) => {
      // 步骤 1：构造一个没有输出路径的任务
      const t = task({ output_paths: [] });

      // 步骤 2：调用 collectOutputs
      const outputs = await collectOutputs(t, dir);

      // 步骤 3：断言返回空数组
      expect(outputs).toEqual([]);
    });
  });
});
