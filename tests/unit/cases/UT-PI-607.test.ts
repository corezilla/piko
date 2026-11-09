/**
 * Case ID: UT-PI-607  ·  STATUS: real
 *
 * 责任：分支 L209 `!allFailed`（!；skill-prefetch.ts）
 * 维度坐标：`prefetchSkillContext` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-607.md（脚本的唯一依据）
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

describe("UT-PI-607 · prefetchSkillContext · 状态分支 × 合法迁移", () => {
  it("does not cache when the only backend failed", async () => {
const anIdentity = (over: Record<string, unknown> = {}) => ({
  role: "tester",
  userId: "user-1",
  defaultScope: "project",
  ...over,
});
const aMem0 = (result: unknown[] | Error) => ({
  search: vi.fn(async () => {
    if (result instanceof Error) throw result;
    return result;
  }),
});
    // 步骤 1：造一个失败的后端与一个没配的后端
    const down = aMem0(new Error("down"));

    // 步骤 2：调用 prefetchSkillContext
    await prefetchSkillContext("a long enough instruction to pass the minimum length", anIdentity() as never, down as never, undefined);

    // 步骤 3：断言返回值逐值对账——配了的后端全挂即不缓存
    expect(prefetchCacheSize()).toBe(0);
    clearPrefetchCache();
  });

});
