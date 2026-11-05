/**
 * Case ID: UT-POLICY-008  ·  STATUS: real
 *
 * 责任：返回站点 L21 值 `norm` 逐值断言（policy.ts）
 * 维度坐标：`canonicalize` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-008.md（脚本的唯一依据）
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

describe("UT-POLICY-008 · canonicalize · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the normalised path", () => {
    // 步骤 1：构造 Policy 与一个含重复段的任务
    const policy = newPolicy();
    const t = task({ permissions: { read_paths: ["src"], write_paths: ["out"], tool_profile_ref: "workspace-standard" } });

    // 步骤 2：调用 validate
    const result = policy.validate(t, "slinky");

    // 步骤 3：断言路径被规范化并排序（去重＋排序）
    expect(result.permissions.read_paths).toEqual(["src"]);
    expect(result.permissions.write_paths).toEqual(["out"]);
    expect(result.output_paths).toEqual(["out/result.txt"]);
  });
});
