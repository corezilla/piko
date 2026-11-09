/**
 * Case ID: UT-PI-824  ·  STATUS: real
 *
 * 责任：分支 L111 `char === "\\" && quote !== "'"`（&&；tool-exec-policy.ts）
 * 维度坐标：`tokenize` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-824.md（脚本的唯一依据）
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

describe("UT-PI-824 · tokenize · 状态分支 × 合法迁移", () => {
  it("treats a backslash outside quotes as an escape", async () => {
    // 步骤 2：调用 tokenize（引号外的反斜杠）
    const tokens = tokenize("a\\ b");

    // 步骤 3：断言返回值逐值对账——&& 的前半段为真即转义，
    //         转义后反斜杠本身不进词，只有空格进
    expect(tokens).toEqual(["a b"]);
  });

});
