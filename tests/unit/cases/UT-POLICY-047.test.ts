/**
 * Case ID: UT-POLICY-047  ·  STATUS: real
 *
 * 责任：参数 `result: AgentResult` 的 `每等价类合法值` 类（policy.ts:55）
 * 维度坐标：`validateResult` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-047.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Policy } from "../../../src/policy.js";
import { normalizedTask, sameTask } from "../../../src/task-equality.js";
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

function newPolicy(): Policy {
  return new Policy(config, tools);
}

const task = (over: Partial<TaskRequest> = {}): TaskRequest => ({
  task_id: "t-1",
  instruction: "do it",
  workspace_ref: "piko",
  permissions: { read_paths: ["src"], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: ["out/result.txt"],
  ...over,
} as TaskRequest);

const result = (over: Partial<AgentResult> = {}): AgentResult => ({
  task_id: "t-1",
  generation: 1,
  state: "Completed",
  partial: false,
  failure: null,
  usage: {} as never,
  published_at: "2026-11-05T00:00:00.000Z",
  ...over,
} as unknown as AgentResult);

describe("UT-POLICY-047 · validateResult · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts a well-formed completed result", () => {
    // 步骤 1：构造 Policy 与一个合法的 Completed 结果
    const policy = newPolicy();

    // 步骤 2：调用 validateResult
    // 步骤 3：断言不抛错
    expect(() => policy.validateResult(result())).not.toThrow();
  });
});
