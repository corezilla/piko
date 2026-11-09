/**
 * Case ID: UT-PI-741  ·  STATUS: real
 *
 * 责任：分支 L165 `? name.length > 0 :`（ternary；tool-exec-policy.ts）
 * 维度坐标：`parseExecutable` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-741.md（脚本的唯一依据）
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

describe("UT-PI-741 · parseExecutable · 状态分支 × 合法迁移", () => {
  it("returns undefined for an empty quoted name", async () => {
    // 步骤 2：调用 parseExecutable（只有引号）
    const executable = parseExecutable("''");

    // 步骤 3：断言返回值逐值对账——去掉引号后名字为空
    expect(executable).toBeUndefined();
  });

});
