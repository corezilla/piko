/**
 * Case ID: UT-PI-524  ·  STATUS: real
 *
 * 责任：分支 L71 `if (skillContext)`（if；pi-runtime.ts）
 * 维度坐标：`buildSystemPrompt` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-524.md（脚本的唯一依据）
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

describe("UT-PI-524 · buildSystemPrompt · 状态分支 × 合法迁移", () => {
  it("renders the context section before the tool hints", async () => {
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
    // 步骤 2：调用 buildSystemPrompt（带 identity、skill context 与 memory）
    const prompt = buildSystemPrompt(
      aTask() as never,
      { role: "tester", name: "Tester", memory: { provider: "mem0", base_url: "https://x", api_key_secret_ref: "env:K" } },
      skillContext() as never,
    );

    // 步骤 3：断言返回值逐值对账——上下文段在工具提示之前
    expect(prompt.indexOf("=== Context ===")).toBeLessThan(prompt.indexOf("mem0_lookup"));
  });

});
