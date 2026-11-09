/**
 * Case ID: UT-PI-517  ·  STATUS: real
 *
 * 责任：可选参数 `identity` 缺省/显式两态（pi-runtime.ts:55）
 * 维度坐标：`buildSystemPrompt` × `字符串/路径/枚举输入` × `未知枚举`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-517.md（脚本的唯一依据）
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

describe("UT-PI-517 · buildSystemPrompt · 字符串/路径/枚举输入 × 未知枚举", () => {
  it("defaults the identity to none", async () => {
const aTask = (over: Record<string, unknown> = {}) => ({
  task_id: "t-1",
  instruction: "do the thing",
  workspace_ref: "piko",
  permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
  output_paths: [],
  ...over,
});
    // 步骤 2：调用 buildSystemPrompt（不传 identity）
    const prompt = buildSystemPrompt(aTask() as never, undefined);

    // 步骤 3：断言返回值逐值对账——缺省即只有基础提示
    expect(prompt).not.toContain("You are acting as");
  });

});
