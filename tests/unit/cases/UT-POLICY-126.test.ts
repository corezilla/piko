/**
 * Case ID: UT-POLICY-126  ·  STATUS: real
 *
 * 责任：参数 `workspace` 的 `注入字符` 类（workspace.ts:32）
 * 维度坐标：`collectOutputs` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-126.md（脚本的唯一依据）
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

describe("UT-POLICY-126 · collectOutputs · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected workspace path as data", async () => {
    // 步骤 1：构造一个注入形态的 workspace
    const outputs = await collectOutputs(task(), "/tmp/$(rm -rf /)");

    // 步骤 2：断言空数组（路径不存在，未执行任何命令）
    expect(outputs).toEqual([]);
  });
});
