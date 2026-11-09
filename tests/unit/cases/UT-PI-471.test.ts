/**
 * Case ID: UT-PI-471  ·  STATUS: real
 *
 * 责任：返回站点 L38 值 `/\((?:502|503)\)|provider_unavailable|m…` 逐值断言（pi-runtime.ts）
 * 维度坐标：`isProviderUnavailableMessage` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-471.md（脚本的唯一依据）
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

describe("UT-PI-471 · isProviderUnavailableMessage · 纯函数/无副作用 × 每等价类合法值", () => {
  it("matches the provider-unavailable patterns", async () => {
    // 步骤 2：调用 isProviderUnavailableMessage（命中模式的串）
    // 步骤 3：断言返回值逐值对账——模式命中即 true
    expect(isProviderUnavailableMessage("OpenAI API error (503): provider_unavailable")).toBe(true);
    expect(isProviderUnavailableMessage("fetch failed")).toBe(true);
    expect(isProviderUnavailableMessage("ECONNREFUSED")).toBe(true);
  });

});
