/**
 * Case ID: UT-PI-732  ·  STATUS: real
 *
 * 责任：分支 L147 `loop (tokens.length > 0 && ENV_ASSIGNMENT.tes…`（loop；tool-exec-policy.ts）
 * 维度坐标：`parseExecutable` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-732.md（脚本的唯一依据）
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

describe("UT-PI-732 · parseExecutable · 状态分支 × 合法迁移", () => {
  it("skips every leading environment assignment", async () => {
    // 步骤 2：调用 parseExecutable（两个环境变量赋值）
    const executable = parseExecutable("FOO=1 BAR=2 python3");

    // 步骤 3：断言返回值逐值对账——赋值都被跳过
    expect(executable).toBe("python3");
  });

});
