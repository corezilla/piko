/**
 * Case ID: UT-PI-625  ·  STATUS: real
 *
 * 责任：资源操作 L233 `clearTimeout`（skill-prefetch.ts）
 * 维度坐标：`withTimeout` × `资源获取/释放` × `正常释放`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-625.md（脚本的唯一依据）
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

describe("UT-PI-625 · withTimeout · 资源获取/释放 × 正常释放", () => {
  it("clears the timer when the promise resolves", async () => {
    // 步骤 1：开假定时器
    vi.useFakeTimers();
    try {
      // 步骤 2：调用 withTimeout（一个会兑现的 promise）
      const value = await withTimeout(Promise.resolve("ok"), 1000);

      // 步骤 3：断言定时器被清掉——没有残留的未触发定时器
      expect(value).toBe("ok");
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

});
