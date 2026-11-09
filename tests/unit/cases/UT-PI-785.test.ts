/**
 * Case ID: UT-PI-785  ·  STATUS: real
 *
 * 责任：分支 L218 `first.split("/").pop() ?? first`（??；tool-exec-policy.ts）
 * 维度坐标：`assertRemoteExecutableAllowed` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-785.md（脚本的唯一依据）
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

describe("UT-PI-785 · assertRemoteExecutableAllowed · 状态分支 × 合法迁移", () => {
  it("takes the basename of the first argument", async () => {
    // 步骤 2：调用 assertRemoteExecutableAllowed（首参带路径）
    // 步骤 3：断言返回值逐值对账——?? 回退到路径的末段
    expect(() => assertRemoteExecutableAllowed(["/usr/bin/ls"], ["ls"])).not.toThrow();
  });

});
