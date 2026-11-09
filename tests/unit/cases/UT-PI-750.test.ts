/**
 * Case ID: UT-PI-750  ·  STATUS: real
 *
 * 责任：分支 L180 `!found.includes(executable)`（!；tool-exec-policy.ts）
 * 维度坐标：`parseExecutables` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-750.md（脚本的唯一依据）
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

describe("UT-PI-750 · parseExecutables · 状态分支 × 合法迁移", () => {
  it("does not add an executable twice", async () => {
    // 步骤 2：调用 parseExecutables（重复的执行文件）
    // 步骤 3：断言返回值逐值对账——! 的后半段为假即不加
    expect(parseExecutables("ls; ls")).toEqual(["ls"]);
  });

});
