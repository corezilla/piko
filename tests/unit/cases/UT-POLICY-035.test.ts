/**
 * Case ID: UT-POLICY-035  ·  STATUS: real
 *
 * 责任：分支 L36 if : if (!this.tools.profiles[task.permissions.tool_pro（policy.ts）
 * 维度坐标：`validate` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-035.md（脚本的唯一依据）
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

describe("UT-POLICY-035 · validate · 状态分支 × 合法迁移", () => {
  it("accepts a task whose tool profile ref is registered", () => {
    // 步骤 1：构造 Policy 与一个引用已注册 profile 的任务
    const policy = newPolicy();
    const t = task({ permissions: { read_paths: ["src"], write_paths: ["out"], tool_profile_ref: "workspace-standard" } });

    // 步骤 2：调用 validate
    const result = policy.validate(t, "slinky");

    // 步骤 3：断言通过（守卫为假）
    expect(result.task_id).toBe("t-1");
  });
});
