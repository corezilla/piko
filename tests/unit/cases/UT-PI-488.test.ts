/**
 * Case ID: UT-PI-488  ·  STATUS: real
 *
 * 责任：参数 `timestamp: inferred` 的 `边界(上/下/零/空/满)` 类（pi-runtime.ts:43）
 * 维度坐标：`initialPrompt` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-488.md（脚本的唯一依据）
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

describe("UT-PI-488 · initialPrompt · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("stamps the zero timestamp", async () => {
    // 步骤 2：调用 initialPrompt（零时间戳）
    const prompt = initialPrompt({ instruction: "x" } as never, undefined, 0);

    // 步骤 3：断言返回值逐值对账——零也是合法时间戳
    expect((prompt as { timestamp: number }).timestamp).toBe(0);
  });

});
