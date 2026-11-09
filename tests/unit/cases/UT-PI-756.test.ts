/**
 * Case ID: UT-PI-756  ·  STATUS: real
 *
 * 责任：参数 `allowlist: readonly string[]` 的 `超长` 类（tool-exec-policy.ts:193）
 * 维度坐标：`assertExecutablesAllowed` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-756.md（脚本的唯一依据）
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

describe("UT-PI-756 · assertExecutablesAllowed · 字符串/路径/枚举输入 × 超长", () => {
  it("allows an over-long allowlist entry", async () => {
    // 步骤 2：调用 assertExecutablesAllowed（超长允许表项）
    const entry = "a".repeat(10000);
    expect(() => assertExecutablesAllowed(entry, [entry])).not.toThrow();
  });

});
