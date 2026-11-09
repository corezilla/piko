/**
 * Case ID: UT-PI-787  ·  STATUS: real
 *
 * 责任：分支 L220 `if (!allowed.has(name))`（if；tool-exec-policy.ts）
 * 维度坐标：`assertRemoteExecutableAllowed` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-787.md（脚本的唯一依据）
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

describe("UT-PI-787 · assertRemoteExecutableAllowed · 状态分支 × 合法迁移", () => {
  it("rejects an executable that is not on the allowlist", async () => {
    // 步骤 2：调用 assertRemoteExecutableAllowed（首参不在允许表内）
    // 步骤 3：断言被拒
    expect(() => assertRemoteExecutableAllowed(["rm"], ["ls"])).toThrow(/executable not allowed/);
  });

});
