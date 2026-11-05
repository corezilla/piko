/**
 * Case ID: UT-POLICY-039  ·  STATUS: real
 *
 * 责任：分支 L39 ! : !inRead（policy.ts）
 * 维度坐标：`validate` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-039.md（脚本的唯一依据）
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

describe("UT-POLICY-039 · validate · 状态分支 × 合法迁移", () => {
  it("accepts an output that is writable only", () => {
    // 步骤 1：构造 Policy 与一个只在 write_paths 下的输出
    const policy = newPolicy();
    const t = task({ permissions: { read_paths: ["src"], write_paths: ["out"], tool_profile_ref: "workspace-standard" }, output_paths: ["out/report.txt"] });

    // 步骤 2：调用 validate
    const result = policy.validate(t, "slinky");

    // 步骤 3：断言被接受（inWrite 为真）
    expect(result.output_paths).toEqual(["out/report.txt"]);
  });
});
