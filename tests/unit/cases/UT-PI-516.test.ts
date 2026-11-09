/**
 * Case ID: UT-PI-516  ·  STATUS: real
 *
 * 责任：参数 `identity: {role:string;name:string;memory?:MemoryConfig;doc_search?:Do` 的 `注入字符` 类（pi-runtime.ts:55）
 * 维度坐标：`buildSystemPrompt` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-516.md（脚本的唯一依据）
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

describe("UT-PI-516 · buildSystemPrompt · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected identity as data", async () => {
const aTask = (over: Record<string, unknown> = {}) => ({
  task_id: "t-1",
  instruction: "do the thing",
  workspace_ref: "piko",
  permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
  output_paths: [],
  ...over,
});
    // 步骤 2：调用 buildSystemPrompt（注入串 role）
    const prompt = buildSystemPrompt(aTask() as never, { role: "$(rm -rf /)", name: "x" });

    // 步骤 3：断言返回值逐值对账——不被解释
    expect(prompt).toContain("$(rm -rf /)");
  });

});
