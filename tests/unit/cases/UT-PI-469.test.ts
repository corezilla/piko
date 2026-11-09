/**
 * Case ID: UT-PI-469  ·  STATUS: real
 *
 * 责任：参数 `message: string` 的 `超长` 类（pi-runtime.ts:37）
 * 维度坐标：`isProviderUnavailableMessage` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-469.md（脚本的唯一依据）
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

describe("UT-PI-469 · isProviderUnavailableMessage · 字符串/路径/枚举输入 × 超长", () => {
  it("reports an over-long message as available", async () => {
    // 步骤 2：调用 isProviderUnavailableMessage（超长串）
    // 步骤 3：断言返回值逐值对账——不匹配即 false
    expect(isProviderUnavailableMessage("x".repeat(10000))).toBe(false);
  });

});
