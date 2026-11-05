/**
 * Case ID: UT-POLICY-005  ·  STATUS: real
 *
 * 责任：分支 L14 if : isAbsolute(rel)（policy.ts）
 * 维度坐标：`canonicalize` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `POLICY`）
 * 用例文档：docs/70_verification/unit/cases/UT-POLICY-005.md（脚本的唯一依据）
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

describe("UT-POLICY-005 · canonicalize · 状态分支 × 合法迁移", () => {
  it("rejects an absolute path", () => {
    // 步骤 1：构造 Policy 与一个含绝对路径的任务
    const policy = newPolicy();
    const bad = task({ permissions: { read_paths: ["/etc/passwd"], write_paths: ["out"], tool_profile_ref: "workspace-standard" } });

    // 步骤 2：调用 validate（经 canonicalize）
    // 步骤 3：断言 InvalidRequest 且消息逐值指出是绝对路径
    try {
      policy.validate(bad, "slinky");
      expect.unreachable("应当抛出");
    } catch (e) {
      expect((e as { code: string }).code).toBe("InvalidRequest");
      expect((e as { message: string }).message).toContain("absolute path rejected");
    }
  });
});
