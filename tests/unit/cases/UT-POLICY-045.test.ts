/**
 * Case ID: UT-POLICY-045  ·  STATUS: real
 *
 * 责任：throw L42 ScopeDenied（守卫 `if (!inRead && !inWrite)`；policy.ts）
 * 维度坐标：`validate` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-045.md（脚本的唯一依据）
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

describe("UT-POLICY-045 · validate · 错误路径 × 每个 typed 错误码", () => {
  it("throws the declared unauthorised-output error", () => {
    // 步骤 1：构造 Policy 与一个未授权的输出
    const policy = newPolicy();
    const t = task({ output_paths: ["elsewhere/report.txt"] });

    // 步骤 2：调用 validate
    // 步骤 3：断言 typed 错误码与状态码逐值对账
    try {
      policy.validate(t, "slinky");
      expect.unreachable("应当抛出");
    } catch (e) {
      expect((e as { code: string }).code).toBe("ScopeDenied");
      expect((e as { status: number }).status).toBe(403);
      expect((e as { message: string }).message).toContain("output not authorised");
    }
  });
});
