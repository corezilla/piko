/**
 * Case ID: UT-PI-790  ·  STATUS: real
 *
 * 责任：返回站点 L214 值 `（无值 return：提前退出）` 逐值断言（tool-exec-policy.ts）
 * 维度坐标：`assertRemoteExecutableAllowed` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-790.md（脚本的唯一依据）
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

describe("UT-PI-790 · assertRemoteExecutableAllowed · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns without a value when the allowlist is empty", async () => {
    // 步骤 2：调用 assertRemoteExecutableAllowed（空允许表）
    // 步骤 3：断言返回值逐值对账——提前退出，无返回值
    expect(assertRemoteExecutableAllowed(["rm"], [])).toBeUndefined();
  });

});
