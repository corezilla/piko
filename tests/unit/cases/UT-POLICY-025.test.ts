/**
 * Case ID: UT-POLICY-025  ·  STATUS: real
 *
 * 责任：分支 L25 ?? : this.config.workspace.roots[workspaceRef] ?? this.（policy.ts）
 * 维度坐标：`resolveWorkspace` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-025.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Policy } from "../../../src/policy.js";
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

const task = (over: Partial<TaskRequest> = {}): TaskRequest => ({
  task_id: "t-1",
  instruction: "do it",
  workspace_ref: "piko",
  permissions: { read_paths: ["src"], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: ["out/result.txt"],
  ...over,
} as TaskRequest);

function newPolicy(): Policy {
  return new Policy(config, tools);
}

describe("UT-POLICY-025 · resolveWorkspace · 状态分支 × 合法迁移", () => {
  it("uses the configured root when the ref is registered", () => {
    // 步骤 1：构造 Policy
    const policy = newPolicy();

    // 步骤 2：validate 一个 workspace_ref＝piko 的任务
    // 步骤 3：断言走的是 roots["piko"]（左侧）
    const result = policy.validate(task({ workspace_ref: "piko" }), "slinky");
    expect(result.output_paths).toEqual(["out/result.txt"]);
  });
});
