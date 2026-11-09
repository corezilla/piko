/**
 * Case ID: UT-PI-771  ·  STATUS: real
 *
 * 责任：参数 `executable: string` 的 `空` 类（tool-exec-policy.ts:21）
 * 维度坐标：`ExecPolicyViolationError.constructor` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-771.md（脚本的唯一依据）
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

describe("UT-PI-771 · ExecPolicyViolationError.constructor · 字符串/路径/枚举输入 × 空", () => {
  it("carries an empty executable", async () => {
    // 步骤 2：构造 ExecPolicyViolationError（空 executable）
    const error = new ExecPolicyViolationError("executable_not_allowed", "msg", "");

    // 步骤 3：断言返回值逐值对账
    expect(error.executable).toBe("");
  });

});
