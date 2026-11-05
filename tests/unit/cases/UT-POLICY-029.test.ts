/**
 * Case ID: UT-POLICY-029  ·  STATUS: real
 *
 * 责任：参数 `task: TaskRequest` 的 `每等价类合法值` 类（policy.ts:31）
 * 维度坐标：`validate` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-029.md（脚本的唯一依据）
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

describe("UT-POLICY-029 · validate · 纯函数/无副作用 × 每等价类合法值", () => {
  it("normalises a valid task", () => {
    // 步骤 1：构造 Policy 与一个合法任务
    const policy = newPolicy();
    const t = task();

    // 步骤 2：调用 validate(task, "slinky")
    const result = policy.validate(t, "slinky");

    // 步骤 3：断言路径被去重并排序
    expect(result.permissions.read_paths).toEqual(["src"]);
    expect(result.output_paths).toEqual(["out/result.txt"]);
    expect(result.task_id).toBe("t-1");
  });
});
