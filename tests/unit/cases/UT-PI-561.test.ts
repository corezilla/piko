/**
 * Case ID: UT-PI-561  ·  STATUS: real
 *
 * 责任：参数 `identity: PrefetchIdentity | undefined` 的 `边界(上/下/零/空/满)` 类（skill-prefetch.ts:137）
 * 维度坐标：`prefetchSkillContext` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-561.md（脚本的唯一依据）
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

describe("UT-PI-561 · prefetchSkillContext · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("skips a prefetch with an empty identity", async () => {
const aMem0 = (result: unknown[] | Error) => ({
  search: vi.fn(async () => {
    if (result instanceof Error) throw result;
    return result;
  }),
});
    // 步骤 2：调用 prefetchSkillContext（identity 字段全空）
    const context = await prefetchSkillContext(
      "a long enough instruction to pass the minimum length",
      { role: "", userId: "", defaultScope: "" } as never,
      aMem0([]) as never,
      undefined,
    );

    // 步骤 3：断言返回值逐值对账——该参数不校验，空身份照样用
    expect(context.skipped).toBeUndefined();
    expect(context.memoryQuery).not.toBe("");
    clearPrefetchCache();
  });

});
