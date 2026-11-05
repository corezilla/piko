/**
 * Case ID: UT-POLICY-056  ·  STATUS: real
 *
 * 责任：throw L60 InternalError（守卫 `if (result.state === "Failed" && result.failure == null)`；policy.ts）
 * 维度坐标：`validateResult` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-056.md（脚本的唯一依据）
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

describe("UT-POLICY-056 · validateResult · 错误路径 × 每个 typed 错误码", () => {
  it("throws the declared internal error for a failed result without a failure", () => {
    // 步骤 1：构造 Policy 与一个无 failure 的 Failed 结果
    const policy = newPolicy();

    // 步骤 2：调用 validateResult
    // 步骤 3：断言 typed 错误码与状态码逐值对账
    try {
      policy.validateResult(result({ state: "Failed", failure: null }));
      expect.unreachable("应当抛出");
    } catch (e) {
      expect((e as { code: string }).code).toBe("InternalError");
      expect((e as { status: number }).status).toBe(500);
      expect((e as { message: string }).message).toBe("Failed result must carry a failure");
    }
  });
});
