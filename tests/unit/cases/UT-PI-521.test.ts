/**
 * Case ID: UT-PI-521  ·  STATUS: real
 *
 * 责任：可选参数 `skillContext` 缺省/显式两态（pi-runtime.ts:55）
 * 维度坐标：`buildSystemPrompt` × `纯函数/无副作用` × `未知枚举`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-521.md（脚本的唯一依据）
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

describe("UT-PI-521 · buildSystemPrompt · 纯函数/无副作用 × 未知枚举", () => {
  it("defaults the skill context to none", async () => {
const aTask = (over: Record<string, unknown> = {}) => ({
  task_id: "t-1",
  instruction: "do the thing",
  workspace_ref: "piko",
  permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
  output_paths: [],
  ...over,
});
    // 步骤 2：调用 buildSystemPrompt（不传 skill context）
    const prompt = buildSystemPrompt(aTask() as never, { role: "r", name: "n" });

    // 步骤 3：断言返回值逐值对账——缺省即没有上下文段
    expect(prompt).not.toContain("=== Context ===");
  });

});
