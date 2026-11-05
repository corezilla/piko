/**
 * Case ID: UT-POLICY-152  ·  STATUS: real
 *
 * 责任：参数 `roots` 的 `超长` 类（workspace.ts:9）
 * 维度坐标：`resolveWorkspace` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-152.md（脚本的唯一依据）
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

describe("UT-POLICY-152 · resolveWorkspace · 字符串/路径/枚举输入 × 超长", () => {
  it("rejects a ref that is not in a large roots map", async () => {
    // 步骤 1：构造一个很大的 roots 映射（不含该 ref）
    const roots: Record<string, string> = {};
    for (let i = 0; i < 100; i += 1) roots[`r${i}`] = `/workspace/${"x".repeat(100)}`;

    // 步骤 2：调用 resolveWorkspace("missing", roots)
    // 步骤 3：断言被拒
    await expect(resolveWorkspace("missing", roots)).rejects.toThrow(/unknown workspace_ref/);
  });
});
