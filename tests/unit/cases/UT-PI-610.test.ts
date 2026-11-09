/**
 * Case ID: UT-PI-610  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #1：被调方 `Promise.allSettled([` 拒绝必须 typed 化上抛（skill-prefetch.ts:137）
 * 维度坐标：`prefetchSkillContext` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-610.md（脚本的唯一依据）
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

describe("UT-PI-610 · prefetchSkillContext · 错误路径 × 每个 typed 错误码", () => {
  it("never throws when a backend fails", async () => {
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
    // 步骤 1：造一个必然失败的后端
    const backend = aMem0(new Error("down"));

    // 步骤 2：调用 prefetchSkillContext
    const context = await prefetchSkillContext("a long enough instruction to pass the minimum length", anIdentity() as never, backend as never, undefined);

    // 步骤 3：断言返回值逐值对账——失败被降级成空结果，不冒泡
    expect(context.memory).toEqual([]);
    expect(context.sources.memory).toBe("unavailable");
    clearPrefetchCache();
  });

});
