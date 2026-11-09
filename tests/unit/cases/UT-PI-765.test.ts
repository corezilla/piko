/**
 * Case ID: UT-PI-765  ·  STATUS: real
 *
 * 责任：参数 `code: "executable_not_allowed"` 的 `每等价类合法值` 类（tool-exec-policy.ts:21）
 * 维度坐标：`ExecPolicyViolationError.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-765.md（脚本的唯一依据）
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

describe("UT-PI-765 · ExecPolicyViolationError.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("carries the code and the executable", async () => {
    // 步骤 2：构造 ExecPolicyViolationError
    const error = new ExecPolicyViolationError("executable_not_allowed", "executable not allowed: rm", "rm");

    // 步骤 3：断言返回值逐值对账
    expect(error.code).toBe("executable_not_allowed");
    expect(error.message).toBe("executable not allowed: rm");
    expect(error.executable).toBe("rm");
  });

});
