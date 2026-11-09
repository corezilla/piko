/**
 * Case ID: UT-PI-828  ·  STATUS: real
 *
 * 责任：分支 L126 `if (char === '"' || char === "'")`（if；tool-exec-policy.ts）
 * 维度坐标：`tokenize` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-828.md（脚本的唯一依据）
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

describe("UT-PI-828 · tokenize · 状态分支 × 合法迁移", () => {
  it("opens a quote on either quote character", async () => {
    // 步骤 2：调用 tokenize（单引号与双引号）
    const single = tokenize("'a b'");
    const double = tokenize("\"a b\"");

    // 步骤 3：断言返回值逐值对账——两种引号都把空格包住
    expect(single).toEqual(["a b"]);
    expect(double).toEqual(["a b"]);
  });

});
