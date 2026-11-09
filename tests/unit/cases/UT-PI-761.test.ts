/**
 * Case ID: UT-PI-761  ·  STATUS: real
 *
 * 责任：分支 L198 `if (!allowed.has(executable))`（if；tool-exec-policy.ts）
 * 维度坐标：`assertExecutablesAllowed` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-761.md（脚本的唯一依据）
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

describe("UT-PI-761 · assertExecutablesAllowed · 状态分支 × 合法迁移", () => {
  it("rejects an executable that is not on the allowlist", async () => {
    // 步骤 2：调用 assertExecutablesAllowed（执行文件不在允许表内）
    // 步骤 3：断言被拒
    expect(() => assertExecutablesAllowed("rm -rf /", ["ls"])).toThrow(/executable not allowed/);
  });

});
