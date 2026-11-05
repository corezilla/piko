/**
 * Case ID: UT-POLICY-065  ·  STATUS: real
 *
 * 责任：参数 `path: string` 的 `注入字符` 类（policy.ts:65）
 * 维度坐标：`within` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-065.md（脚本的唯一依据）
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

describe("UT-POLICY-065 · within · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected output path as data", () => {
    // 步骤 1：构造 Policy 与一个注入形态的输出路径
    const policy = newPolicy();
    const t = task({ output_paths: ["out/$(rm -rf /).txt"] });

    // 步骤 2：调用 validate
    // 步骤 3：断言被接受（在 out 授权范围内）且只当路径字符
    expect(policy.validate(t, "slinky").output_paths).toEqual(["out/$(rm -rf /).txt"]);
  });});
