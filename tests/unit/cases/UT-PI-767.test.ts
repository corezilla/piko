/**
 * Case ID: UT-PI-767  ·  STATUS: real
 *
 * 责任：参数 `code: "executable_not_allowed"` 的 `非法值` 类（tool-exec-policy.ts:21）
 * 维度坐标：`ExecPolicyViolationError.constructor` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-767.md（脚本的唯一依据）
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

describe("UT-PI-767 · ExecPolicyViolationError.constructor · 纯函数/无副作用 × 非法值", () => {
  it("does not validate the code", async () => {
    // 步骤 2：构造 ExecPolicyViolationError（非法 code）
    const error = new ExecPolicyViolationError("not-a-code" as never, "msg");

    // 步骤 3：断言返回值逐值对账——该参数不校验
    expect(error.code).toBe("not-a-code");
  });

});
