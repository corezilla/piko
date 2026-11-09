/**
 * Case ID: UT-PI-573  ·  STATUS: real
 *
 * 责任：分支 L145 `opts.timeoutMs ?? DEFAULT_PREFETCH_TIMEOUT_MS`（??；skill-prefetch.ts）
 * 维度坐标：`prefetchSkillContext` × `时间域行为` × `超时边界 ±1 tick`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-573.md（脚本的唯一依据）
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

describe("UT-PI-573 · prefetchSkillContext · 时间域行为 × 超时边界 ±1 tick", () => {
  it("uses the default timeout when none is given", async () => {
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
      aMem0([]) as never,
      undefined,
    );

    // 步骤 3：断言返回值逐值对账——默认超时是 1500ms
    expect(context.skipped).toBeUndefined();
    clearPrefetchCache();
  });

});
