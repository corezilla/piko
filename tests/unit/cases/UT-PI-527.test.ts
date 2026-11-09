/**
 * Case ID: UT-PI-527  ·  STATUS: real
 *
 * 责任：返回站点 L61 值 `base` 逐值断言（pi-runtime.ts）
 * 维度坐标：`buildSystemPrompt` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-527.md（脚本的唯一依据）
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

describe("UT-PI-527 · buildSystemPrompt · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the base prompt", async () => {
const aTask = (over: Record<string, unknown> = {}) => ({
  task_id: "t-1",
  instruction: "do the thing",
  workspace_ref: "piko",
  permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
  output_paths: [],
  ...over,
});
    // 步骤 2：调用 buildSystemPrompt（无 identity）
    const prompt = buildSystemPrompt(aTask() as never);

    // 步骤 3：断言返回值逐值对账——基础提示逐字对账
    expect(prompt).toBe(
      "You are Piko, executing one durable task. Work only inside the configured workspace and pass workspace-relative paths to tools. Produce requested outputs and finish with a concise result summary.\n",
    );
  });

});
