/**
 * Case ID: UT-POLICY-154  ·  STATUS: real
 *
 * 责任：分支 L10 ! : !configured（workspace.ts）
 * 维度坐标：`resolveWorkspace` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-154.md（脚本的唯一依据）
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

describe("UT-POLICY-154 · resolveWorkspace · 状态分支 × 合法迁移", () => {
  it("takes the true side when the ref is not configured", async () => {
    // 步骤 1：构造 roots（不含该 ref）
    const roots = { other: "/workspace/other" };

    // 步骤 2：调用 resolveWorkspace("piko", roots)
    // 步骤 3：断言被拒（守卫取真）
    await expect(resolveWorkspace("piko", roots)).rejects.toThrow(/unknown workspace_ref/);
  });
});
