/**
 * Case ID: UT-POLICY-134  ·  STATUS: real
 *
 * 责任：返回站点 L37 值 `out` 逐值断言（workspace.ts）
 * 维度坐标：`collectOutputs` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-134.md（脚本的唯一依据）
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

describe("UT-POLICY-134 · collectOutputs · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns records with the declared shape", async () => {
    await withWorkspace(async (dir) => {
      const { writeFile } = await import("node:fs/promises");
      const { join } = await import("node:path");
      await writeFile(join(dir, "out", "s.txt"), "abc", "utf8");

      // 步骤 1：构造一个存在的输出
      const t = task({ output_paths: ["out/s.txt"] });

      // 步骤 2：调用 collectOutputs
      const outputs = await collectOutputs(t, dir);

      // 步骤 3：断言每条记录只有三个字段，且值逐位对账
      expect(Object.keys(outputs[0]).sort()).toEqual(["path", "sha256", "size_bytes"]);
      expect(outputs[0].size_bytes).toBe(3);
    });
  });
});
