/**
 * Case ID: UT-PI-805  ·  STATUS: real
 *
 * 责任：分支 L49 `loop (command)`（loop；tool-exec-policy.ts）
 * 维度坐标：`splitCommands` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-805.md（脚本的唯一依据）
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

describe("UT-PI-805 · splitCommands · 状态分支 × 合法迁移", () => {
  it("walks every character of the command", async () => {
    // 步骤 2：调用 splitCommands
    // 步骤 3：断言返回值逐值对账——每个字符都被扫过，没有丢失
    expect(splitCommands("a b")).toEqual(["a b"]);
  });

});
