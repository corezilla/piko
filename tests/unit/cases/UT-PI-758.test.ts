/**
 * Case ID: UT-PI-758  ·  STATUS: real
 *
 * 责任：分支 L194 `if (allowlist.length === 0)`（if；tool-exec-policy.ts）
 * 维度坐标：`assertExecutablesAllowed` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-758.md（脚本的唯一依据）
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

describe("UT-PI-758 · assertExecutablesAllowed · 状态分支 × 合法迁移", () => {
  it("returns early when the allowlist is empty", async () => {
    // 步骤 2：调用 assertExecutablesAllowed（空允许表）
    // 步骤 3：断言提前退出——不解析命令即返回
    expect(() => assertExecutablesAllowed("rm -rf /", [])).not.toThrow();
  });

});
