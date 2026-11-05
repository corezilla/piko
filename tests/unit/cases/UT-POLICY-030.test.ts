/**
 * Case ID: UT-POLICY-030  ·  STATUS: real
 *
 * 责任：参数 `task` 的 `边界(上/下/零/空/满)` 类（policy.ts:31）
 * 维度坐标：`validate` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-030.md（脚本的唯一依据）
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

describe("UT-POLICY-030 · validate · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts a task with no paths at all", () => {
    // 步骤 1：构造 Policy 与一个路径全空的任务
    const policy = newPolicy();
    const t = task({ permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" }, output_paths: [] });

    // 步骤 2：调用 validate
    const result = policy.validate(t, "slinky");

    // 步骤 3：断言被接受（没有输出要授权）
    expect(result.output_paths).toEqual([]);
    expect(result.permissions.read_paths).toEqual([]);
  });
});
