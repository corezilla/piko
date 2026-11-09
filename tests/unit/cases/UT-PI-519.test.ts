/**
 * Case ID: UT-PI-519  ·  STATUS: real
 *
 * 责任：参数 `skillContext: PrefetchedSkillContext` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:55）
 * 维度坐标：`buildSystemPrompt` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-519.md（脚本的唯一依据）
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

describe("UT-PI-519 · buildSystemPrompt · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("renders an empty context section", async () => {
const aTask = (over: Record<string, unknown> = {}) => ({
  task_id: "t-1",
  instruction: "do the thing",
  workspace_ref: "piko",
  permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
  output_paths: [],
  ...over,
});
const skillContext = (over: Record<string, unknown> = {}) => ({
  memory: [],
  docs: [],
  memoryQuery: "q",
  docsQuery: "q",
  sources: { memory: "empty", docs: "empty" },
  ...over,
});
    // 步骤 2：调用 buildSystemPrompt（空的 skill context）
    const prompt = buildSystemPrompt(aTask() as never, { role: "r", name: "n" }, skillContext() as never);

    // 步骤 3：断言返回值逐值对账——段在，内容为空
    expect(prompt).toContain("=== Context ===");
    expect(prompt).toContain("(0 found)");
  });

});
