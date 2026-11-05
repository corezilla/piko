/**
 * Case ID: UT-POLICY-117  ·  STATUS: real
 *
 * 责任：throw L26 ScopeDenied（守卫见 workspace.ts:26）
 * 维度坐标：`authorizePath` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-117.md（脚本的唯一依据）
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

describe("UT-POLICY-117 · authorizePath · 错误路径 × 每个 typed 错误码", () => {
  it("throws the declared outside-workspace error", async () => {
    await withWorkspace(async (dir) => {
      // 步骤 1：构造一个经符号链接逃逸的路径
      const { symlink, mkdir, mkdtemp, rm } = await import("node:fs/promises");
      const { tmpdir } = await import("node:os");
      const { join } = await import("node:path");
      const outside = await mkdtemp(join(tmpdir(), "piko-outside-"));
      await mkdir(outside, { recursive: true });
      await symlink(outside, join(dir, "link"), "dir");
      try {
        // 步骤 2：调用 authorizePath
        // 步骤 3：断言 typed 错误码与状态码逐值对账
        try {
          await authorizePath(dir, "link/x.txt", ["link"]);
          expect.unreachable("应当抛出");
        } catch (e) {
          expect((e as { code: string }).code).toBe("ScopeDenied");
          expect((e as { status: number }).status).toBe(403);
        }
      } finally {
        await rm(outside, { recursive: true, force: true });
      }
    });
  });});
