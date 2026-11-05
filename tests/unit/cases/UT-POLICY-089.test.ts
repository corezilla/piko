/**
 * Case ID: UT-POLICY-089  ·  STATUS: real
 *
 * 责任：参数 `p: string` 的 `超长` 类（workspace.ts:14）
 * 维度坐标：`realpathNearestAncestor` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-089.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Policy } from "../../../src/policy.js";
import { authorizePath, collectOutputs, ensureTaskDirs, resolveWorkspace } from "../../../src/workspace.js";
import { validateUsage } from "../../../src/semantic.js";
import { normalizedTask, sameTask } from "../../../src/task-equality.js";
import type { ToolRegistry } from "../../../src/config.js";
import type { RuntimeConfig, TaskRequest, TokenUsage } from "../../../src/types.js";

const config = {
  workspace: { roots: { piko: "/workspace/piko" }, staging_root: "/workspace/staging" },
} as unknown as RuntimeConfig;

const tools = {
  profile_version: "0.3",
  recovery_contracts: {},
  profiles: { "workspace-standard": { tools: {} } },
} as unknown as ToolRegistry;

const task = (over: Partial<TaskRequest> = {}): TaskRequest => ({
  task_id: "t-1",
  instruction: "do it",
  workspace_ref: "piko",
  permissions: { read_paths: ["src"], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: ["out/result.txt"],
  ...over,
} as TaskRequest);

const usage = (over: Partial<TokenUsage> = {}): TokenUsage => ({
  source: "PiModelResponses",
  quality: "Complete",
  input_tokens: 10,
  output_tokens: 5,
  total_tokens: 15,
  cache_read_tokens: 0,
  cache_write_tokens: 0,
  reasoning_tokens: 0,
  model_attempts: 2,
  usage_observed_attempts: 2,
  missing_fields: [],
  ...over,
} as TokenUsage);

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

describe("UT-POLICY-089 · realpathNearestAncestor · 字符串/路径/枚举输入 × 超长", () => {
  it("resolves to the workspace for an over-long input", async () => {
    await withWorkspace(async (dir) => {
      // 步骤 1：构造一个超长 input
      const input = "x".repeat(4096);

      // 步骤 2：调用 authorizePath(dir, input, ["src"])
      // 步骤 3：断言被权限检查拒——祖先回退到工作区根，它不在 allowed 之下
      await expect(authorizePath(dir, input, ["src"], false)).rejects.toThrow(/outside task permissions/);
    });
  });});
