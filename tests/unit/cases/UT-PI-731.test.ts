/**
 * Case ID: UT-PI-731  ·  STATUS: real
 *
 * 责任：参数 `segment: string` 的 `注入字符` 类（tool-exec-policy.ts:143）
 * 维度坐标：`parseExecutable` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-731.md（脚本的唯一依据）
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

describe("UT-PI-731 · parseExecutable · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected segment as data", async () => {
    // 步骤 2：调用 parseExecutable（注入串）
    const executable = parseExecutable("$(rm -rf /)");

    // 步骤 3：断言返回值逐值对账——不被解释；tokenize 按空白切分，
    //         故取的是第一个词 "$(rm"
    expect(executable).toBe("$(rm");
  });

});
