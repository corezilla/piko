/**
 * Case ID: UT-POLICY-004  ·  STATUS: real
 *
 * 责任：参数 `tools: ToolRegistry` 的 `每等价类合法值` 类（policy.ts:8）
 * 维度坐标：`Policy.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-004.md（脚本的唯一依据）
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

describe("UT-POLICY-004 · Policy.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("binds the tool registry and enforces the profile ref", () => {
    // 步骤 1：构造 Policy
    const policy = newPolicy();

    // 步骤 2：validate 一个引用了未注册 profile 的任务
    const bad = task({ permissions: { read_paths: ["src"], write_paths: ["out"], tool_profile_ref: "nope" } });

    // 步骤 3：断言 ScopeDenied（用的是绑定的工具注册表）
    expect(() => policy.validate(bad, "slinky")).toThrow(/unknown tool_profile_ref/);
  });
});
