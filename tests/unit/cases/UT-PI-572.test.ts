/**
 * Case ID: UT-PI-572  ·  STATUS: real
 *
 * 责任：可选参数 `opts` 缺省/显式两态（skill-prefetch.ts:137）
 * 维度坐标：`prefetchSkillContext` × `纯函数/无副作用` × `未知枚举`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-572.md（脚本的唯一依据）
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

describe("UT-PI-572 · prefetchSkillContext · 纯函数/无副作用 × 未知枚举", () => {
  it("defaults the options", async () => {
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
    // 步骤 2：调用 prefetchSkillContext（不传 opts）
    const context = await prefetchSkillContext(
      "a long enough instruction to pass the minimum length",
      anIdentity() as never,
      aMem0([]) as never,
      undefined,
    );

    // 步骤 3：断言返回值逐值对账——缺省即用默认参数
    expect(context.skipped).toBeUndefined();
    clearPrefetchCache();
  });

});
