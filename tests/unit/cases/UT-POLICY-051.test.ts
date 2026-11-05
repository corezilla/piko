/**
 * Case ID: UT-POLICY-051  ·  STATUS: real
 *
 * 责任：分支 L56 && : result.state === "Completed" && (result.partia（policy.ts）
 * 维度坐标：`validateResult` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-051.md（脚本的唯一依据）
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

describe("UT-POLICY-051 · validateResult · 状态分支 × 合法迁移", () => {
  it("does not apply the completed rule to a failed result", () => {
    // 步骤 1：构造 Policy 与一个 partial 的 Failed 结果
    const policy = newPolicy();
    const failed = result({ state: "Failed", partial: true, failure: { code: "X", message: "y" } as never });

    // 步骤 2：调用 validateResult
    // 步骤 3：断言通过（第一项为假，合取短路）
    expect(() => policy.validateResult(failed)).not.toThrow();
  });
});
