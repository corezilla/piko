/**
 * Case ID: UT-PI-778  ·  STATUS: real
 *
 * 责任：参数 `argv: readonly string[]` 的 `注入字符` 类（tool-exec-policy.ts:213）
 * 维度坐标：`assertRemoteExecutableAllowed` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-778.md（脚本的唯一依据）
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

describe("UT-PI-778 · assertRemoteExecutableAllowed · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected argv as data", async () => {
    // 步骤 2：调用 assertRemoteExecutableAllowed（注入串 argv，恰好在允许表内）
    // 步骤 3：断言不抛错——只按等值比对，不被解释
    expect(() => assertRemoteExecutableAllowed(["$(rm -rf /)"], ["$(rm -rf /)"])).not.toThrow();
  });

});
