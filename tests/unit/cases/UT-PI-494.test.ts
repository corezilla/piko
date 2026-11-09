/**
 * Case ID: UT-PI-494  ·  STATUS: real
 *
 * 责任：参数 `value: unknown` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:44）
 * 维度坐标：`normalizeRawUsage` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-494.md（脚本的唯一依据）
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

describe("UT-PI-494 · normalizeRawUsage · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("normalizes an empty record", async () => {
    // 步骤 2：调用 normalizeRawUsage（空对象）
    const usage = normalizeRawUsage({});

    // 步骤 3：断言返回值逐值对账——六个字段都是 undefined
    expect(usage).toEqual({
      input: undefined,
      output: undefined,
      totalTokens: undefined,
      cacheRead: undefined,
      cacheWrite: undefined,
      reasoning: undefined,
    });
  });

});
