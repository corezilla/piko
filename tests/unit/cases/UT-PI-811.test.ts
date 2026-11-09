/**
 * Case ID: UT-PI-811  ·  STATUS: real
 *
 * 责任：分支 L65 `if (char === '"' || char === "'")`（if；tool-exec-policy.ts）
 * 维度坐标：`splitCommands` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-811.md（脚本的唯一依据）
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

describe("UT-PI-811 · splitCommands · 状态分支 × 合法迁移", () => {
  it("opens a quote on either quote character", async () => {
    // 步骤 2：调用 splitCommands（单引号与双引号）
    const single = splitCommands("echo 'a;b'");
    const double = splitCommands("echo \"a;b\"");

    // 步骤 3：断言返回值逐值对账——两种引号都把分隔符包住
    expect(single).toEqual(["echo 'a;b'"]);
    expect(double).toEqual(["echo \"a;b\""]);
  });

});
