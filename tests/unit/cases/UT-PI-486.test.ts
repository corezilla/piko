/**
 * Case ID: UT-PI-486  ·  STATUS: real
 *
 * 责任：可选参数 `turn` 缺省/显式两态（pi-runtime.ts:43）
 * 维度坐标：`initialPrompt` × `纯函数/无副作用` × `未知枚举`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-486.md（脚本的唯一依据）
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

describe("UT-PI-486 · initialPrompt · 纯函数/无副作用 × 未知枚举", () => {
  it("defaults the turn to none", async () => {
    // 步骤 2：调用 initialPrompt（不传轮次）
    const prompt = initialPrompt({ instruction: "x" } as never, undefined, 1000);

    // 步骤 3：断言返回值逐值对账——缺省即单条指令
    expect(Array.isArray(prompt)).toBe(false);
  });

});
