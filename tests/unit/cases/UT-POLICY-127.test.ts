/**
 * Case ID: UT-POLICY-127  ·  STATUS: real
 *
 * 责任：分支 L34 loop : loop (task.output_paths)（workspace.ts）
 * 维度坐标：`collectOutputs` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-127.md（脚本的唯一依据）
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

describe("UT-POLICY-127 · collectOutputs · 状态分支 × 合法迁移", () => {
  it("collects every output path", async () => {
    await withWorkspace(async (dir) => {
      const { writeFile } = await import("node:fs/promises");
      const { join } = await import("node:path");
      await writeFile(join(dir, "out", "a.txt"), "a", "utf8");
      await writeFile(join(dir, "out", "b.txt"), "bb", "utf8");

      // 步骤 1：构造两个输出的任务
      const t = task({ output_paths: ["out/a.txt", "out/b.txt"] });

      // 步骤 2：调用 collectOutputs
      const outputs = await collectOutputs(t, dir);

      // 步骤 3：断言循环走完两个输出
      expect(outputs).toHaveLength(2);
      expect(outputs.map((o) => o.path).sort()).toEqual(["out/a.txt", "out/b.txt"]);
    });
  });
});
