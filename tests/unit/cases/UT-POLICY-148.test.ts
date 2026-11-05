/**
 * Case ID: UT-POLICY-148  ·  STATUS: real
 *
 * 责任：参数 `ref: string` 的 `空` 类（workspace.ts:9）
 * 维度坐标：`resolveWorkspace` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-148.md（脚本的唯一依据）
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

describe("UT-POLICY-148 · resolveWorkspace · 字符串/路径/枚举输入 × 空", () => {
  it("rejects an empty ref", async () => {
    // 步骤 1：构造 roots
    const roots = { piko: "/workspace/piko" };

    // 步骤 2：调用 resolveWorkspace("", roots)
    // 步骤 3：断言 InvalidWorkspace
    await expect(resolveWorkspace("", roots)).rejects.toThrow(/unknown workspace_ref/);
  });
});
