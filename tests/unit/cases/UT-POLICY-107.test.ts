/**
 * Case ID: UT-POLICY-107  ·  STATUS: real
 *
 * 责任：可选参数 `write` 缺省/显式两态（workspace.ts:18）
 * 维度坐标：`authorizePath` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-107.md（脚本的唯一依据）
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

describe("UT-POLICY-107 · authorizePath · 纯函数/无副作用 × 每等价类合法值", () => {
  it("authorises the same path in read and write mode", async () => {
    await withWorkspace(async (dir) => {
      // 步骤 1：调用两次 authorizePath —— 一次省略 write，一次显式 false
      const implicit = await authorizePath(dir, "src/a.txt", ["src"]);
      const explicit = await authorizePath(dir, "src/a.txt", ["src"], false);

      // 步骤 2：断言两者结果相同（缺省即 false）
      expect(implicit).toBe(explicit);
    });
  });
});
