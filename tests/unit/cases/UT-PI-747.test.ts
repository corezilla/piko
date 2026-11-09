/**
 * Case ID: UT-PI-747  ·  STATUS: real
 *
 * 责任：分支 L178 `loop (splitCommands(command))`（loop；tool-exec-policy.ts）
 * 维度坐标：`parseExecutables` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-747.md（脚本的唯一依据）
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

describe("UT-PI-747 · parseExecutables · 状态分支 × 合法迁移", () => {
  it("collects the executables of every segment", async () => {
    // 步骤 2：调用 parseExecutables（两个命令）
    const executables = parseExecutables("ls; rm -rf /");

    // 步骤 3：断言返回值逐值对账——两段的执行文件都在
    expect(executables).toEqual(["ls", "rm"]);
  });

});
