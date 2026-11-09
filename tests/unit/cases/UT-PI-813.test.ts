/**
 * Case ID: UT-PI-813  ·  STATUS: real
 *
 * 责任：分支 L70 `if (char === ";" || char === "|" || char === …`（if；tool-exec-policy.ts）
 * 维度坐标：`splitCommands` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-813.md（脚本的唯一依据）
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

describe("UT-PI-813 · splitCommands · 状态分支 × 合法迁移", () => {
  it("splits on every separator kind", async () => {
    // 步骤 2：调用 splitCommands（四种分隔符）
    const segments = splitCommands("a;b|c&d\ne");

    // 步骤 3：断言返回值逐值对账——四种都切
    expect(segments).toEqual(["a", "b", "c", "d", "e"]);
  });

});
