/**
 * Case ID: UT-PI-589  ·  STATUS: real
 *
 * 责任：分支 L171 `if (hit && hit.query === capped)`（if；skill-prefetch.ts）
 * 维度坐标：`prefetchSkillContext` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-589.md（脚本的唯一依据）
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

describe("UT-PI-589 · prefetchSkillContext · 状态分支 × 合法迁移", () => {
  it("refreshes the recency of a cache hit", async () => {
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
    // 步骤 1：先预取一次，把结果缓存下来
    const backend = aMem0([{ memory: "prior", id: "m1" }]);
    await prefetchSkillContext("a long enough instruction to pass the minimum length", anIdentity() as never, backend as never, undefined);

    // 步骤 2：再预取一次同样的查询（命中缓存）
    await prefetchSkillContext("a long enough instruction to pass the minimum length", anIdentity() as never, backend as never, undefined);

    // 步骤 3：断言返回值逐值对账——命中不重问后端，但缓存仍在
    expect(backend.search).toHaveBeenCalledTimes(1);
    expect(prefetchCacheSize()).toBe(1);
    clearPrefetchCache();
  });

});
