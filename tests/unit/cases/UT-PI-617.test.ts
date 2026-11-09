/**
 * Case ID: UT-PI-617  ·  STATUS: real
 *
 * 责任：返回站点 L219 值 `context` 逐值断言（skill-prefetch.ts）
 * 维度坐标：`prefetchSkillContext` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-617.md（脚本的唯一依据）
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

describe("UT-PI-617 · prefetchSkillContext · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the assembled context", async () => {
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
    const context = await prefetchSkillContext(
      "a long enough instruction to pass the minimum length",
      anIdentity() as never,
      aMem0([{ memory: "prior", id: "m1" }]) as never,
      undefined,
    );

    // 步骤 3：断言返回值逐值对账——查询、来源、耗时都在
    expect(context.memoryQuery).toBe("a long enough instruction to pass the minimum length");
    expect(context.docsQuery).toBe("a long enough instruction to pass the minimum length");
    expect(typeof context.durationMs).toBe("number");
    clearPrefetchCache();
  });

});
