/**
 * Case ID: UT-PI-802  ·  STATUS: real
 *
 * 责任：参数 `command: string` 的 `空` 类（tool-exec-policy.ts:43）
 * 维度坐标：`splitCommands` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-802.md（脚本的唯一依据）
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

describe("UT-PI-802 · splitCommands · 字符串/路径/枚举输入 × 空", () => {
  it("returns no segment for an empty command", async () => {
    // 步骤 2：调用 splitCommands（空串）
    const segments = splitCommands("");

    // 步骤 3：断言返回值逐值对账——空串被过滤掉
    expect(segments).toEqual([]);
  });

});
