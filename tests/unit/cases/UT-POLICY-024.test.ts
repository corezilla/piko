/**
 * Case ID: UT-POLICY-024  ·  STATUS: real
 *
 * 责任：参数 `workspaceRef` 的 `注入字符` 类（policy.ts:24）
 * 维度坐标：`resolveWorkspace` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-024.md（脚本的唯一依据）
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

describe("UT-POLICY-024 · resolveWorkspace · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected workspace ref as data", () => {
    // 步骤 1：构造 Policy
    const policy = newPolicy();

    // 步骤 2：validate 一个注入形态的 workspace_ref
    // 步骤 3：断言只当普通键查找，不执行
    const result = policy.validate(task({ workspace_ref: "$(rm -rf /)" }), "slinky");
    expect(result.output_paths).toEqual(["out/result.txt"]);
  });
});
