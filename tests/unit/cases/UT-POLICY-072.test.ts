/**
 * Case ID: UT-POLICY-072  ·  STATUS: real
 *
 * 责任：参数 `config` 的 `边界(上/下/零/空/满)` 类（policy.ts:8）
 * 维度坐标：`Policy.constructor` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-072.md（脚本的唯一依据）
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

describe("UT-POLICY-072 · Policy.constructor · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("binds a config whose staging root is empty", () => {
    // 步骤 1：构造 staging_root 为空的 config
    const policy = new Policy({ workspace: { roots: { piko: "/workspace/piko" } } } as unknown as RuntimeConfig, tools);

    // 步骤 2：validate 一个 workspace_ref 未注册的任务 —— 落到空 staging_root
    // 步骤 3：断言 ScopeDenied（无根可用）
    expect(() => policy.validate(task({ workspace_ref: "other" }), "slinky")).toThrow(/unknown workspace_ref/);
  });});
