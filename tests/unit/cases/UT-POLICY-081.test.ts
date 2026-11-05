/**
 * Case ID: UT-POLICY-081  ·  STATUS: real
 *
 * 责任：参数 `a: TaskRequest` 的 `每等价类合法值` 类（task-equality.ts:4）
 * 维度坐标：`sameTask` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-081.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Policy } from "../../../src/policy.js";
import { normalizedTask, sameTask } from "../../../src/task-equality.js";
import type { ToolRegistry } from "../../../src/config.js";
import type { AgentResult, RuntimeConfig, TaskRequest } from "../../../src/types.js";

const config = {
  workspace: { roots: { piko: "/workspace/piko" }, staging_root: "/workspace/staging" },
} as unknown as RuntimeConfig;

const tools = {
  profile_version: "0.3",
  recovery_contracts: {},
  profiles: { "workspace-standard": { tools: {} } },
} as unknown as ToolRegistry;

function newPolicy(): Policy {
  return new Policy(config, tools);
}

const task = (over: Partial<TaskRequest> = {}): TaskRequest => ({
  task_id: "t-1",
  instruction: "do it",
  workspace_ref: "piko",
  permissions: { read_paths: ["src"], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: ["out/result.txt"],
  ...over,
} as TaskRequest);

const result = (over: Partial<AgentResult> = {}): AgentResult => ({
  task_id: "t-1",
  generation: 1,
  state: "Completed",
  partial: false,
  failure: null,
  usage: {} as never,
  published_at: "2026-11-05T00:00:00.000Z",
  ...over,
} as unknown as AgentResult);

describe("UT-POLICY-081 · sameTask · 纯函数/无副作用 × 每等价类合法值", () => {
  it("compares two identical tasks as the same", () => {
    // 步骤 1：构造两个路径顺序不同的同一任务
    const a = task({ permissions: { read_paths: ["z", "a"], write_paths: ["out"], tool_profile_ref: "workspace-standard" } });
    const b = task({ permissions: { read_paths: ["a", "z"], write_paths: ["out"], tool_profile_ref: "workspace-standard" } });

    // 步骤 2：调用 sameTask(a, b)
    // 步骤 3：断言为 true（规范化后相同）
    expect(sameTask(a, b)).toBe(true);
  });});
