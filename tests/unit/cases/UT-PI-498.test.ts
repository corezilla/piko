/**
 * Case ID: UT-PI-498  ·  STATUS: real
 *
 * 责任：分支 L44 `? typeof raw?.input_tokens==="number" :`（ternary；pi-runtime.ts）
 * 维度坐标：`normalizeRawUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-498.md（脚本的唯一依据）
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

describe("UT-PI-498 · normalizeRawUsage · 状态分支 × 合法迁移", () => {
  it("takes the input token count when it is a number", async () => {
    // 步骤 2：调用 normalizeRawUsage（input_tokens 是数字）
    const usage = normalizeRawUsage({ input_tokens: 42 });

    // 步骤 3：断言返回值逐值对账——三元取真即取该值
    expect(usage.input).toBe(42);
  });

});
