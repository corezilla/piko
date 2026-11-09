/**
 * Case ID: UT-PI-506  ·  STATUS: real
 *
 * 责任：分支 L44 `? typeof input?.cache_write_tokens==="number"…`（ternary；pi-runtime.ts）
 * 维度坐标：`normalizeRawUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-506.md（脚本的唯一依据）
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

describe("UT-PI-506 · normalizeRawUsage · 状态分支 × 合法迁移", () => {
  it("takes the cache-write token count when it is a number", async () => {
    // 步骤 2：调用 normalizeRawUsage（cache_write_tokens 是数字）
    const usage = normalizeRawUsage({ input_tokens_details: { cache_write_tokens: 6 } });

    // 步骤 3：断言返回值逐值对账——三元取真即取该值
    expect(usage.cacheWrite).toBe(6);
  });

});
