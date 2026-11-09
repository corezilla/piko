/**
 * Case ID: UT-PI-806  ·  STATUS: real
 *
 * 责任：分支 L50 `if (escaped)`（if；tool-exec-policy.ts）
 * 维度坐标：`splitCommands` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-806.md（脚本的唯一依据）
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

describe("UT-PI-806 · splitCommands · 状态分支 × 合法迁移", () => {
  it("keeps an escaped separator in the segment", async () => {
    // 步骤 2：调用 splitCommands（带转义的分号）
    const segments = splitCommands("echo a\\;b");

    // 步骤 3：断言返回值逐值对账——转义的分号不是分隔符，
    //         整条命令是一段；反斜杠本身也留在段里
    expect(segments).toEqual(["echo a\\;b"]);
  });

});
