/**
 * Case ID: UT-PI-789  ·  STATUS: real
 *
 * 责任：throw L221 `executable_not_allowed`（守卫 `if (!allowed.has(name))`；tool-exec-policy.ts）
 * 维度坐标：`assertRemoteExecutableAllowed` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-789.md（脚本的唯一依据）
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

describe("UT-PI-789 · assertRemoteExecutableAllowed · 错误路径 × 每个 typed 错误码", () => {
  it("reports the declared executable-not-allowed error", async () => {
    // 步骤 2：调用 assertRemoteExecutableAllowed（首参不在允许表内）
    // 步骤 3：断言错误逐值对账——code 与 executable 都在
    expect(() => assertRemoteExecutableAllowed(["rm"], ["ls"])).toThrow(
      expect.objectContaining({ code: "executable_not_allowed", executable: "rm" }),
    );
  });

});
