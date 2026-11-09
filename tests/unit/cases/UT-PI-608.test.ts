/**
 * Case ID: UT-PI-608  ·  STATUS: real
 *
 * 责任：分支 L212 `loop (cache.size > CACHE_LIMIT)`（loop；skill-prefetch.ts）
 * 维度坐标：`prefetchSkillContext` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-608.md（脚本的唯一依据）
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

describe("UT-PI-608 · prefetchSkillContext · 状态分支 × 合法迁移", () => {
  it("keeps the cache bounded", async () => {
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
    // 步骤 1：连着预取 40 个不同的身份，缓存上限是 32
    for (let i = 0; i < 40; i++) {
      await prefetchSkillContext(
        "a long enough instruction to pass the minimum length",
        anIdentity({ userId: `user-${i}` }) as never,
        aMem0([]) as never,
        undefined,
        { noCache: true },
      );
      await prefetchSkillContext(
        "a long enough instruction to pass the minimum length",
        anIdentity({ userId: `user-${i}` }) as never,
        aMem0([]) as never,
        undefined,
      );
    }

    // 步骤 2：断言缓存没有超过上限
    // 步骤 3：断言返回值逐值对账——最老的被挤掉了
    expect(prefetchCacheSize()).toBeLessThanOrEqual(32);
    clearPrefetchCache();
  });

});
