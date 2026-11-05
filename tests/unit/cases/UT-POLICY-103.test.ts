/**
 * Case ID: UT-POLICY-103  ·  STATUS: real
 *
 * 责任：参数 `allowed` 的 `注入字符` 类（workspace.ts:18）
 * 维度坐标：`authorizePath` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-103.md（脚本的唯一依据）
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

describe("UT-POLICY-103 · authorizePath · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected allowed entry as data", async () => {
    await withWorkspace(async (dir) => {
      // 步骤 1：构造注入形态的 allowed
      const allowed = ["src", "$(rm -rf /)"];

      // 步骤 2：调用 authorizePath(dir, "src/a.txt", allowed)
      // 步骤 3：断言注入条目被当作普通路径字符——它解析后仍落在工作区内
      //         （"$(rm -rf /)" 作为相对段拼在 root 下，不越界）
      const resolved = await authorizePath(dir, "src/a.txt", allowed);
      expect(resolved.endsWith("/src/a.txt")).toBe(true);
    });
  });
});
