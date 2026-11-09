/**
 * Case ID: UT-PI-510  ·  STATUS: real
 *
 * 责任：返回站点 L44 值 `{input:typeof raw?.input_tokens==="numb…` 逐值断言（pi-runtime.ts）
 * 维度坐标：`normalizeRawUsage` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-510.md（脚本的唯一依据）
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

describe("UT-PI-510 · normalizeRawUsage · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the six normalized fields", async () => {
    // 步骤 2：调用 normalizeRawUsage
    const usage = normalizeRawUsage({ input_tokens: 1, output_tokens: 2 });

    // 步骤 3：断言返回值逐值对账——六个键逐个对上
    expect(Object.keys(usage).sort()).toEqual([
      "cacheRead",
      "cacheWrite",
      "input",
      "output",
      "reasoning",
      "totalTokens",
    ]);
    expect(usage.input).toBe(1);
    expect(usage.output).toBe(2);
  });

});
