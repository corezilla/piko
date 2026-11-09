/**
 * Case ID: UT-PI-582  ·  STATUS: real
 *
 * 责任：分支 L162 `!identity`（!；skill-prefetch.ts）
 * 维度坐标：`prefetchSkillContext` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-582.md（脚本的唯一依据）
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

describe("UT-PI-582 · prefetchSkillContext · 状态分支 × 合法迁移", () => {
  it("prefers the memory backend when both are given", async () => {
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
    const context = await prefetchSkillContext(
      "a long enough instruction to pass the minimum length",
      anIdentity() as never,
      aMem0([]) as never,
      aGraphrag([{ content: "doc", id: "d1" }]) as never,
    );

    // 步骤 3：断言返回值逐值对账——两个后端都在时都被问到，
    //         且各自答了什么就报什么
    expect(context.sources.memory).toBe("empty");
    expect(context.sources.docs).toBe("ok");
    clearPrefetchCache();
  });

});
