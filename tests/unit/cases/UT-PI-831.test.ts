/**
 * Case ID: UT-PI-831  ·  STATUS: real
 *
 * 责任：分支 L131 `if (current.length > 0)`（if；tool-exec-policy.ts）
 * 维度坐标：`tokenize` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-831.md（脚本的唯一依据）
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

describe("UT-PI-831 · tokenize · 状态分支 × 合法迁移", () => {
  it("does not add an empty token for consecutive whitespace", async () => {
    // 步骤 2：调用 tokenize（连续空格）
    const tokens = tokenize("a  b");

    // 步骤 3：断言返回值逐值对账——&& 的后半段为假即不加空词
    expect(tokens).toEqual(["a", "b"]);
  });

});
