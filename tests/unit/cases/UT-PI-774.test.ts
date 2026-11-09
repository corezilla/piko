/**
 * Case ID: UT-PI-774  ·  STATUS: real
 *
 * 责任：可选参数 `executable` 缺省/显式两态（tool-exec-policy.ts:21）
 * 维度坐标：`ExecPolicyViolationError.constructor` × `字符串/路径/枚举输入` × `未知枚举`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-774.md（脚本的唯一依据）
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

describe("UT-PI-774 · ExecPolicyViolationError.constructor · 字符串/路径/枚举输入 × 未知枚举", () => {
  it("defaults the executable to undefined", async () => {
    // 步骤 2：构造 ExecPolicyViolationError（不传 executable）
    const error = new ExecPolicyViolationError("executable_not_allowed", "msg");

    // 步骤 3：断言返回值逐值对账——可选参数缺省即 undefined
    expect(error.executable).toBeUndefined();
  });

});
