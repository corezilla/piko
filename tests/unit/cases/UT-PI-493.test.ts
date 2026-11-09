/**
 * Case ID: UT-PI-493  ·  STATUS: real
 *
 * 责任：参数 `value: unknown` 的 `每等价类合法值` 类（pi-runtime.ts:44）
 * 维度坐标：`normalizeRawUsage` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-493.md（脚本的唯一依据）
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

describe("UT-PI-493 · normalizeRawUsage · 纯函数/无副作用 × 每等价类合法值", () => {
  it("normalizes a full usage record", async () => {
    // 步骤 2：调用 normalizeRawUsage（完整记录）
    const usage = normalizeRawUsage({
      input_tokens: 10,
      output_tokens: 5,
      total_tokens: 15,
      input_tokens_details: { cached_tokens: 2, cache_write_tokens: 1 },
      output_tokens_details: { reasoning_tokens: 3 },
    });

    // 步骤 3：断言返回值逐值对账——六个字段逐个对上
    expect(usage).toEqual({
      input: 10,
      output: 5,
      totalTokens: 15,
      cacheRead: 2,
      cacheWrite: 1,
      reasoning: 3,
    });
  });

});
