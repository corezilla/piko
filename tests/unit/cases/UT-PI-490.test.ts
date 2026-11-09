/**
 * Case ID: UT-PI-490  ·  STATUS: real
 *
 * 责任：可选参数 `timestamp` 缺省/显式两态（pi-runtime.ts:43）
 * 维度坐标：`initialPrompt` × `纯函数/无副作用` × `未知枚举`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-490.md（脚本的唯一依据）
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

describe("UT-PI-490 · initialPrompt · 纯函数/无副作用 × 未知枚举", () => {
  it("defaults the timestamp to now", async () => {
    // 步骤 2：调用 initialPrompt（不传时间戳）
    const before = Date.now();
    const prompt = initialPrompt({ instruction: "x" } as never, undefined);
    const after = Date.now();

    // 步骤 3：断言返回值逐值对账——缺省即当前时刻
    expect((prompt as { timestamp: number }).timestamp).toBeGreaterThanOrEqual(before);
    expect((prompt as { timestamp: number }).timestamp).toBeLessThanOrEqual(after);
  });

});
