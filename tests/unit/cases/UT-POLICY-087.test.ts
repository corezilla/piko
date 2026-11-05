/**
 * Case ID: UT-POLICY-087  ·  STATUS: real
 *
 * 责任：返回站点 L4 值 （task-equality.ts）
 * 维度坐标：`sameTask` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-087.md（脚本的唯一依据）
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

describe("UT-POLICY-087 · sameTask · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns a boolean for every comparison", () => {
    // 步骤 1：构造同一个任务
    const a = task();

    // 步骤 2：调用 sameTask(a, a) 与 sameTask(a, task())
    const same = sameTask(a, task());
    const alsoSame = sameTask(a, a);

    // 步骤 3：断言返回布尔值且自反为真
    expect(typeof same).toBe("boolean");
    expect(same).toBe(true);
    expect(alsoSame).toBe(true);
  });
});
