/**
 * Case ID: UT-PI-807  ·  STATUS: real
 *
 * 责任：分支 L55 `if (char === "\\" && quote !== "'")`（if；tool-exec-policy.ts）
 * 维度坐标：`splitCommands` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-807.md（脚本的唯一依据）
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

describe("UT-PI-807 · splitCommands · 状态分支 × 合法迁移", () => {
  it("does not treat a backslash inside single quotes as an escape", async () => {
    // 步骤 2：调用 splitCommands（单引号里的反斜杠）
    const segments = splitCommands("echo 'a\\';b'");

    // 步骤 3：断言返回值逐值对账——单引号里反斜杠不转义，
    //         故闭合引号后紧跟的分号就是分隔符
    expect(segments).toEqual(["echo 'a\\'", "b'"]);
  });

});
