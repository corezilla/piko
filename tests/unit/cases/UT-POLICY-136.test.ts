/**
 * Case ID: UT-POLICY-136  ·  STATUS: real
 *
 * 责任：参数 `workspace` 的 `超长` 类（workspace.ts:41）
 * 维度坐标：`ensureTaskDirs` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-136.md（脚本的唯一依据）
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

describe("UT-POLICY-136 · ensureTaskDirs · 字符串/路径/枚举输入 × 超长", () => {
  it("does not create directories under an over-long workspace path", async () => {
    // 步骤 1：构造一个超长 workspace
    // 步骤 2：调用 ensureTaskDirs —— mkdir 的 ENAMETOOLONG 被原样上抛
    // 步骤 3：断言拒绝被上抛（该方法不吞文件系统错误）
    await expect(ensureTaskDirs("w".repeat(4096), task())).rejects.toThrow(/ENAMETOOLONG|name too long/);
  });
});
