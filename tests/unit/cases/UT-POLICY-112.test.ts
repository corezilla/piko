/**
 * Case ID: UT-POLICY-112  ·  STATUS: real
 *
 * 责任：分支 L25 ternary : ? write :（workspace.ts）
 * 维度坐标：`authorizePath` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-112.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { authorizePath, collectOutputs, ensureTaskDirs, resolveWorkspace } from "../../../src/workspace.js";
import type { TaskRequest } from "../../../src/types.js";

const task = (over: Partial<TaskRequest> = {}): TaskRequest => ({
  task_id: "t-1",
  instruction: "do it",
  workspace_ref: "piko",
  permissions: { read_paths: ["src"], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: ["out/result.txt"],
  ...over,
} as TaskRequest);

/** 一个真实的临时工作区。 */
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

describe("UT-POLICY-112 · authorizePath · 状态分支 × 合法迁移", () => {
  it("keeps the file name when reconstructing the write target", async () => {
    await withWorkspace(async (dir) => {
      // 步骤 1：调用 authorizePath（write=true）
      const resolved = await authorizePath(dir, "out/sub/new.txt", ["out"], true);

      // 步骤 2：断言末尾是文件名（父目录被 resolve 后拼接）
      expect(resolved.endsWith("/new.txt")).toBe(true);
    });
  });
});
