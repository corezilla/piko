/**
 * Case ID: UT-PI-753  ·  STATUS: real
 *
 * 责任：参数 `command: string` 的 `超长` 类（tool-exec-policy.ts:193）
 * 维度坐标：`assertExecutablesAllowed` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-753.md（脚本的唯一依据）
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

describe("UT-PI-753 · assertExecutablesAllowed · 字符串/路径/枚举输入 × 超长", () => {
  it("allows an over-long command whose executable is allowed", async () => {
    // 步骤 2：调用 assertExecutablesAllowed（超长命令，允许表含它的执行文件）
    expect(() => assertExecutablesAllowed("ls " + "a".repeat(10000), ["ls"])).not.toThrow();
  });

});
