/**
 * Case ID: UT-PI-738  ·  STATUS: real
 *
 * 责任：分支 L160 `if (!first)`（if；tool-exec-policy.ts）
 * 维度坐标：`parseExecutable` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-738.md（脚本的唯一依据）
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

describe("UT-PI-738 · parseExecutable · 状态分支 × 合法迁移", () => {
  it("returns undefined when there is no first token", async () => {
    // 步骤 2：调用 parseExecutable（只有环境变量赋值）
    const executable = parseExecutable("FOO=1");

    // 步骤 3：断言返回值逐值对账——if 的前半段为真即没有可执行文件
    expect(executable).toBeUndefined();
  });

});
