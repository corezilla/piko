/**
 * Case ID: UT-PI-619  ·  STATUS: real
 *
 * 责任：参数 `promise: Promise<T>` 的 `边界(上/下/零/空/满)` 类（skill-prefetch.ts:229）
 * 维度坐标：`withTimeout` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-619.md（脚本的唯一依据）
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
import {
  cacheKey,
  clearPrefetchCache,
  prefetchCacheSize,
  prefetchSkillContext,
  renderDocEntry,
  renderMemoryEntry,
  renderSkillContext,
  withTimeout,
} from "../../../src/skill-prefetch.js";
import { fakeFetch } from "./support/pi-fix.js";

describe("UT-PI-619 · withTimeout · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("resolves when the promise settles with the boundary", async () => {
    // 步骤 2：调用 withTimeout（刚好在边界内兑现）
    const value = await withTimeout(Promise.resolve(1), 50);

    // 步骤 3：断言返回值逐值对账
    expect(value).toBe(1);
  });

});
