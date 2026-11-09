/**
 * Case ID: UT-PI-814  ·  STATUS: real
 *
 * 责任：分支 L70 `char === ";" || char === "|" || char === "&" …`（||；tool-exec-policy.ts）
 * 维度坐标：`splitCommands` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-814.md（脚本的唯一依据）
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

describe("UT-PI-814 · splitCommands · 状态分支 × 合法迁移", () => {
  it("splits on the newline among the separators", async () => {
    // 步骤 2：调用 splitCommands（换行）
    // 步骤 3：断言返回值逐值对账——|| 的第三段为真即切
    expect(splitCommands("a\nb")).toEqual(["a", "b"]);
  });

});
