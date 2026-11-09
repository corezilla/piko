/**
 * Case ID: UT-PI-752  ·  STATUS: real
 *
 * 责任：参数 `command: string` 的 `空` 类（tool-exec-policy.ts:193）
 * 维度坐标：`assertExecutablesAllowed` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-752.md（脚本的唯一依据）
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

describe("UT-PI-752 · assertExecutablesAllowed · 字符串/路径/枚举输入 × 空", () => {
  it("allows an empty command when the allowlist is not empty", async () => {
    // 步骤 2：调用 assertExecutablesAllowed（空命令，非空允许表）
    // 步骤 3：断言不抛错——空命令没有可执行文件可拦
    expect(() => assertExecutablesAllowed("", ["ls"])).not.toThrow();
  });

});
