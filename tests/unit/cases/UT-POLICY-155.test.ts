/**
 * Case ID: UT-POLICY-155  ·  STATUS: real
 *
 * 责任：throw L10 InvalidWorkspace（守卫 `if (!configured)`；workspace.ts）
 * 维度坐标：`resolveWorkspace` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-155.md（脚本的唯一依据）
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

describe("UT-POLICY-155 · resolveWorkspace · 错误路径 × 每个 typed 错误码", () => {
  it("throws the declared invalid-workspace error", async () => {
    // 步骤 1：构造 roots（不含该 ref）
    const roots = { other: "/workspace/other" };

    // 步骤 2：调用 resolveWorkspace("piko", roots)
    // 步骤 3：断言 typed 错误码与状态码逐值对账
    try {
      await resolveWorkspace("piko", roots);
      expect.unreachable("应当抛出");
    } catch (e) {
      expect((e as { code: string }).code).toBe("InvalidWorkspace");
      expect((e as { status: number }).status).toBe(422);
      expect((e as { message: string }).message).toContain("unknown workspace_ref");
    }
  });
});
