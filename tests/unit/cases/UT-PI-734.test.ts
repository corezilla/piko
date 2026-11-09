/**
 * Case ID: UT-PI-734  ·  STATUS: real
 *
 * 责任：分支 L152 `loop (tokens.length > 0 && WRAPPER_COMMANDS.h…`（loop；tool-exec-policy.ts）
 * 维度坐标：`parseExecutable` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-734.md（脚本的唯一依据）
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

describe("UT-PI-734 · parseExecutable · 状态分支 × 合法迁移", () => {
  it("skips every leading wrapper command", async () => {
    // 步骤 2：调用 parseExecutable（两个包装命令）
    const executable = parseExecutable("sudo nohup python3");

    // 步骤 3：断言返回值逐值对账——包装命令都被跳过
    expect(executable).toBe("python3");
  });

});
