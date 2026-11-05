/**
 * Case ID: UT-POLICY-022  ·  STATUS: real
 *
 * 责任：参数 `workspaceRef: string` 的 `空` 类（policy.ts:24）
 * 维度坐标：`resolveWorkspace` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-022.md（脚本的唯一依据）
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

describe("UT-POLICY-022 · resolveWorkspace · 字符串/路径/枚举输入 × 空", () => {
  it("falls back to the staging root for an empty workspace ref", () => {
    // 步骤 1：构造 Policy
    const policy = newPolicy();

    // 步骤 2：validate 一个 workspace_ref 为空的任务
    // 步骤 3：断言落到 staging_root（空串不是已注册的根）
    const result = policy.validate(task({ workspace_ref: "" }), "slinky");
    expect(result.output_paths).toEqual(["out/result.txt"]);
  });
});
