/**
 * Case ID: UT-POLICY-040  ·  STATUS: real
 *
 * 责任：分支 L40 ! : !inWrite（policy.ts）
 * 维度坐标：`validate` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-040.md（脚本的唯一依据）
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

describe("UT-POLICY-040 · validate · 状态分支 × 合法迁移", () => {
  it("rejects an output that is neither readable nor writable", () => {
    // 步骤 1：构造 Policy 与一个完全未授权的输出
    const policy = newPolicy();
    const t = task({ output_paths: ["elsewhere/report.txt"] });

    // 步骤 2：调用 validate
    // 步骤 3：断言被拒（两个否定项都为真）
    expect(() => policy.validate(t, "slinky")).toThrow(/output not authorised/);
  });
});
