/**
 * Case ID: UT-PI-606  ·  STATUS: real
 *
 * 责任：分支 L209 `!opts.noCache`（!；skill-prefetch.ts）
 * 维度坐标：`prefetchSkillContext` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-606.md（脚本的唯一依据）
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

describe("UT-PI-606 · prefetchSkillContext · 状态分支 × 合法迁移", () => {
  it("caches the fetch when not all backends failed", async () => {
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
const aGraphrag = (result: unknown[] | Error) => ({
  search: vi.fn(async () => {
    if (result instanceof Error) throw result;
    return result;
  }),
});
    // 步骤 1：造一个成功与一个失败的后端
    const ok = aMem0([{ memory: "prior", id: "m1" }]);
    const down = aGraphrag(new Error("down"));

    // 步骤 2：调用 prefetchSkillContext
    await prefetchSkillContext("a long enough instruction to pass the minimum length", anIdentity() as never, ok as never, down as never);

    // 步骤 3：断言返回值逐值对账——有一个成功即缓存
    expect(prefetchCacheSize()).toBe(1);
    clearPrefetchCache();
  });

});
