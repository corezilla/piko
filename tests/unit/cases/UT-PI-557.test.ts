/**
 * Case ID: UT-PI-557  ·  STATUS: real
 *
 * 责任：参数 `query: string` 的 `空` 类（skill-prefetch.ts:137）
 * 维度坐标：`prefetchSkillContext` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-557.md（脚本的唯一依据）
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

describe("UT-PI-557 · prefetchSkillContext · 字符串/路径/枚举输入 × 空", () => {
  it("skips a prefetch with an empty query", async () => {
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
    // 步骤 2：调用 prefetchSkillContext（空查询）
    const context = await prefetchSkillContext("", anIdentity() as never, aMem0([]) as never, undefined);

    // 步骤 3：断言返回值逐值对账——短指令被跳过
    expect(context.skipped).toBe("short_instruction");
    expect(context.memory).toEqual([]);
  });

});
