/**
 * Case ID: UT-PI-827  ·  STATUS: real
 *
 * 责任：分支 L121 `{ current += char; }`（else；tool-exec-policy.ts）
 * 维度坐标：`tokenize` × `状态分支` × `每个非法迁移拒绝`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-827.md（脚本的唯一依据）
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

describe("UT-PI-827 · tokenize · 状态分支 × 每个非法迁移拒绝", () => {
  it("keeps an unquoted word as it is", async () => {
    // 步骤 2：调用 tokenize（普通词）
    const tokens = tokenize("word");

    // 步骤 3：断言返回值逐值对账——else 分支逐字累积
    expect(tokens).toEqual(["word"]);
  });

});
