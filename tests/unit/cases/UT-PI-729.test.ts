/**
 * Case ID: UT-PI-729  ·  STATUS: real
 *
 * 责任：参数 `segment: string` 的 `空` 类（tool-exec-policy.ts:143）
 * 维度坐标：`parseExecutable` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-729.md（脚本的唯一依据）
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

describe("UT-PI-729 · parseExecutable · 字符串/路径/枚举输入 × 空", () => {
  it("returns undefined for an empty segment", async () => {
    // 步骤 2：调用 parseExecutable（空串）
    const executable = parseExecutable("");

    // 步骤 3：断言返回值逐值对账——空段没有可执行文件
    expect(executable).toBeUndefined();
  });

});
