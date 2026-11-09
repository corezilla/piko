/**
 * Case ID: UT-PI-759  ·  STATUS: real
 *
 * 责任：分支 L196 `stripQuotes(entry).split("/").pop() ?? entry`（??；tool-exec-policy.ts）
 * 维度坐标：`assertExecutablesAllowed` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-759.md（脚本的唯一依据）
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

describe("UT-PI-759 · assertExecutablesAllowed · 状态分支 × 合法迁移", () => {
  it("compares the allowlist entry by its basename", async () => {
    // 步骤 2：调用 assertExecutablesAllowed（允许表项带路径）
    // 步骤 3：断言返回值逐值对账——?? 回退到路径的末段
    expect(() => assertExecutablesAllowed("ls", ["/usr/bin/ls"])).not.toThrow();
  });

});
