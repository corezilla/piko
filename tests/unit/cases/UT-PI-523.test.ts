/**
 * Case ID: UT-PI-523  ·  STATUS: real
 *
 * 责任：分支 L61 `!identity`（!；pi-runtime.ts）
 * 维度坐标：`buildSystemPrompt` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-523.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import {
  PolicyViolationError,
  currentAllowlist,
  enterNetworkScope,
  exitNetworkScope,
  installNetworkPolicy,
  makePolicyFetch,
  restoreNetworkPolicy,
} from "../../../src/tool-host-policy.js";
import {
  ExecPolicyViolationError,
  assertExecutablesAllowed,
  assertRemoteExecutableAllowed,
  parseExecutable,
  parseExecutables,
  splitCommands,
  tokenize,
} from "../../../src/tool-exec-policy.js";
import {
  buildSystemPrompt,
  discussionMessage,
  initialPrompt,
  isProviderUnavailableMessage,
  normalizeRawUsage,
} from "../../../src/pi-runtime.js";
import { fakeFetch } from "./support/pi-fix.js";

describe("UT-PI-523 · buildSystemPrompt · 状态分支 × 合法迁移", () => {
  it("adds the identity block when there is an identity", async () => {
const aTask = (over: Record<string, unknown> = {}) => ({
  task_id: "t-1",
  instruction: "do the thing",
  workspace_ref: "piko",
  permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
  output_paths: [],
  ...over,
});
    // 步骤 2：调用 buildSystemPrompt（带 identity）
    const prompt = buildSystemPrompt(aTask() as never, { role: "tester", name: "Tester" });

    // 步骤 3：断言返回值逐值对账——! 的后半段为假即往下走
    expect(prompt).toContain("You are acting as **tester**.");
    expect(prompt).toContain("Your identity: Tester.");
  });

});
