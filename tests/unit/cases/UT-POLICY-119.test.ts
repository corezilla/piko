/**
 * Case ID: UT-POLICY-119  ·  STATUS: real
 *
 * 责任：throw L29 ScopeDenied（守卫见 workspace.ts:29）
 * 维度坐标：`authorizePath` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-119.md（脚本的唯一依据）
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

describe("UT-POLICY-119 · authorizePath · 错误路径 × 每个 typed 错误码", () => {
  it("throws the declared permission error", async () => {
    await withWorkspace(async (dir) => {
      // 步骤 1：构造一个不被任何 allowed 覆盖的路径
      // 步骤 2：调用 authorizePath
      // 步骤 3：断言 typed 错误码与状态码逐值对账
      try {
        await authorizePath(dir, "src/a.txt", ["out"]);
        expect.unreachable("应当抛出");
      } catch (e) {
        expect((e as { code: string }).code).toBe("ScopeDenied");
        expect((e as { status: number }).status).toBe(403);
        expect((e as { message: string }).message).toBe("path is outside task permissions");
      }
    });
  });});
