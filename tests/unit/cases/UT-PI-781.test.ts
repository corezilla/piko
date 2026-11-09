/**
 * Case ID: UT-PI-781  ·  STATUS: real
 *
 * 责任：参数 `allowlist: readonly string[]` 的 `注入字符` 类（tool-exec-policy.ts:213）
 * 维度坐标：`assertRemoteExecutableAllowed` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-781.md（脚本的唯一依据）
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

describe("UT-PI-781 · assertRemoteExecutableAllowed · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected allowlist entry as data", async () => {
    // 步骤 2：调用 assertRemoteExecutableAllowed（注入串允许表项）
    // 步骤 3：断言被拒——条目与 argv 不匹配
    expect(() => assertRemoteExecutableAllowed(["x"], ["$(rm -rf /)"])).toThrow();
  });

});
