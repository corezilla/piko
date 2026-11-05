/**
 * Case ID: UT-POLICY-034  ·  STATUS: real
 *
 * 责任：参数 `_principal: string` 的 `注入字符` 类（policy.ts:31）
 * 维度坐标：`validate` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-034.md（脚本的唯一依据）
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

describe("UT-POLICY-034 · validate · 字符串/路径/枚举输入 × 注入字符", () => {
  it("accepts an injected principal", () => {
    // 步骤 1：构造 Policy 与一个合法任务
    const policy = newPolicy();
    const t = task();

    // 步骤 2：调用 validate(task, an injected principal)
    const principal = "$(rm -rf /)";

    // 步骤 3：断言被接受（principal 不参与判定——该参数以 _ 命名表示未用）
    expect(policy.validate(t, principal).task_id).toBe("t-1");
  });
});
