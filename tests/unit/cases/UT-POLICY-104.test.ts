/**
 * Case ID: UT-POLICY-104  ·  STATUS: real
 *
 * 责任：参数 `write: boolean` 的 `每等价类合法值` 类（workspace.ts:18）
 * 维度坐标：`authorizePath` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-104.md（脚本的唯一依据）
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

describe("UT-POLICY-104 · authorizePath · 纯函数/无副作用 × 每等价类合法值", () => {
  it("authorises a read path when write is false", async () => {
    await withWorkspace(async (dir) => {
      // 步骤 1：构造一个已存在的读路径
      // 步骤 2：调用 authorizePath(dir, "src/a.txt", ["src"], false)
      const resolved = await authorizePath(dir, "src/a.txt", ["src"], false);

      // 步骤 3：断言返回的是那个文件的真实路径
      expect(resolved.endsWith("/src/a.txt")).toBe(true);
    });
  });
});
