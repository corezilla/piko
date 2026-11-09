/**
 * Case ID: UT-PI-526  ·  STATUS: real
 *
 * 责任：分支 L85 `if (identity.doc_search)`（if；pi-runtime.ts）
 * 维度坐标：`buildSystemPrompt` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-526.md（脚本的唯一依据）
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

describe("UT-PI-526 · buildSystemPrompt · 状态分支 × 合法迁移", () => {
  it("adds the doc-search tool hints when doc search is configured", async () => {
const aTask = (over: Record<string, unknown> = {}) => ({
  task_id: "t-1",
  instruction: "do the thing",
  workspace_ref: "piko",
  permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
  output_paths: [],
  ...over,
});
    // 步骤 2：调用 buildSystemPrompt（identity 带 doc_search）
    const prompt = buildSystemPrompt(
      aTask() as never,
      { role: "tester", name: "Tester", doc_search: { provider: "graphrag", base_url: "https://y", api_key_secret_ref: "env:K" } },
    );

    // 步骤 3：断言返回值逐值对账——文档检索工具的提示在
    expect(prompt).toContain("graphrag_search");
  });

});
