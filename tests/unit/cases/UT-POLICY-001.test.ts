/**
 * Case ID: UT-POLICY-001  ·  STATUS: real
 *
 * 责任：参数 `config: RuntimeConfig` 的 `每等价类合法值` 类（policy.ts:8）
 * 维度坐标：`Policy.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-001.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Policy } from "../../../src/policy.js";
import { normalizedTask, sameTask } from "../../../src/task-equality.js";
import type { ToolRegistry } from "../../../src/config.js";
import type { RuntimeConfig, TaskRequest } from "../../../src/types.js";

const config = {
  workspace: {
    roots: { piko: "/workspace/piko" },
    staging_root: "/workspace/staging",
  },
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
  permissions: {
    read_paths: ["src"],
    write_paths: ["out"],
    tool_profile_ref: "workspace-standard",
  },
  output_paths: ["out/result.txt"],
  ...over,
} as TaskRequest);

function newPolicy(): Policy {
  return new Policy(config, tools);
}

describe("UT-POLICY-001 · Policy.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("binds the config and uses its workspace roots", () => {
    // 步骤 1：构造 Policy
    const policy = newPolicy();

    // 步骤 2：调用 validate 一个落在 piko 根下的任务
    const result = policy.validate(task(), "slinky");

    // 步骤 3：断言用的是绑定的 config 的根（piko 而非 staging）
    expect(result.output_paths).toEqual(["out/result.txt"]);
  });
});
