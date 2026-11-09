/**
 * Case ID: UT-PI-749  ·  STATUS: real
 *
 * 责任：分支 L180 `executable && !found.includes(executable)`（&&；tool-exec-policy.ts）
 * 维度坐标：`parseExecutables` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-749.md（脚本的唯一依据）
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

describe("UT-PI-749 · parseExecutables · 状态分支 × 合法迁移", () => {
  it("adds a distinct executable", async () => {
    // 步骤 2：调用 parseExecutables（两个不同的执行文件）
    // 步骤 3：断言返回值逐值对账——&& 的前半段为真即加入
    expect(parseExecutables("ls; pwd")).toEqual(["ls", "pwd"]);
  });

});
