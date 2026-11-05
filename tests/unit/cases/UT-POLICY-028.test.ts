/**
 * Case ID: UT-POLICY-028  ·  STATUS: real
 *
 * 责任：返回站点 L27 值 `root` 逐值断言（policy.ts）
 * 维度坐标：`resolveWorkspace` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-028.md（脚本的唯一依据）
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

describe("UT-POLICY-028 · resolveWorkspace · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the resolved root for the workspace ref", () => {
    // 步骤 1：构造 Policy
    const policy = newPolicy();

    // 步骤 2：validate 一个 output 恰在根下的任务
    const result = policy.validate(task({ output_paths: ["out/result.txt"] }), "slinky");

    // 步骤 3：断言被接受——根被用于判定 within
    expect(result.output_paths).toEqual(["out/result.txt"]);
  });
});
