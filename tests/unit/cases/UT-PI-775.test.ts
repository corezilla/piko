/**
 * Case ID: UT-PI-775  ·  STATUS: real
 *
 * 责任：状态写 L23 → `this.name`（tool-exec-policy.ts）
 * 维度坐标：`ExecPolicyViolationError.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-775.md（脚本的唯一依据）
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

describe("UT-PI-775 · ExecPolicyViolationError.constructor · 状态分支 × 合法迁移", () => {
  it("names the error after its class", async () => {
    // 步骤 2：构造 ExecPolicyViolationError
    const error = new ExecPolicyViolationError("executable_not_allowed", "msg", "rm");

    // 步骤 3：断言状态写生效——name 被设成类名
    expect(error.name).toBe("ExecPolicyViolationError");
  });

});
