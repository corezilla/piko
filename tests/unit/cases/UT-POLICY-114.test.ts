/**
 * Case ID: UT-POLICY-114  ·  STATUS: real
 *
 * 责任：分支 L28 ! : !allowedAbs.every(p=>inside(wsReal,p))（workspace.ts）
 * 维度坐标：`authorizePath` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-114.md（脚本的唯一依据）
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

describe("UT-POLICY-114 · authorizePath · 状态分支 × 合法迁移", () => {
  it("rejects when an allowed entry resolves outside the workspace", async () => {
    await withWorkspace(async (dir) => {
      // 步骤 1：构造一个越界的 allowed 条目
      const allowed = ["src", "../outside"];

      // 步骤 2：调用 authorizePath
      // 步骤 3：断言被拒（allowed path resolves outside workspace）
      await expect(authorizePath(dir, "src/a.txt", allowed)).rejects.toThrow(/allowed path resolves outside workspace/);
    });
  });
});
