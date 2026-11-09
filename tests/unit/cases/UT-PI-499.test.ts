/**
 * Case ID: UT-PI-499  ·  STATUS: real
 *
 * 责任：分支 L44 `raw?.input_tokens`（?.；pi-runtime.ts）
 * 维度坐标：`normalizeRawUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-499.md（脚本的唯一依据）
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

describe("UT-PI-499 · normalizeRawUsage · 状态分支 × 合法迁移", () => {
  it("leaves the input token count undefined when it is not a number", async () => {
    // 步骤 2：调用 normalizeRawUsage（input_tokens 是字符串）
    const usage = normalizeRawUsage({ input_tokens: "42" });

    // 步骤 3：断言返回值逐值对账——三元取假即 undefined
    expect(usage.input).toBeUndefined();
  });

});
