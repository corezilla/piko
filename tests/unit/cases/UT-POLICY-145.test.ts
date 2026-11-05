/**
 * Case ID: UT-POLICY-145  ·  STATUS: real
 *
 * 责任：分支 L50 if : if (!inside(workspace, d))（workspace.ts）
 * 维度坐标：`ensureTaskDirs` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-145.md（脚本的唯一依据）
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

describe("UT-POLICY-145 · ensureTaskDirs · 状态分支 × 合法迁移", () => {
  it("creates the directories it collected", async () => {
    await withWorkspace(async (dir) => {
      const { stat } = await import("node:fs/promises");
      const { join } = await import("node:path");

      // 步骤 1：构造一个工作区内的目录
      const t = task({
        permissions: { read_paths: ["src"], write_paths: ["ok/sub"], tool_profile_ref: "workspace-standard" },
        output_paths: [],
      });

      // 步骤 2：调用 ensureTaskDirs
      await ensureTaskDirs(dir, t);

      // 步骤 3：断言目录被创建（守卫为假）
      expect((await stat(join(dir, "ok"))).isDirectory()).toBe(true);
    });
  });
});
