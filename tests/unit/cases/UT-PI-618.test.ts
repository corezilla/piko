/**
 * Case ID: UT-PI-618  ·  STATUS: real
 *
 * 责任：参数 `promise: Promise<T>` 的 `每等价类合法值` 类（skill-prefetch.ts:229）
 * 维度坐标：`withTimeout` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-618.md（脚本的唯一依据）
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

describe("UT-PI-618 · withTimeout · 纯函数/无副作用 × 每等价类合法值", () => {
  it("resolves when the promise settles in time", async () => {
    // 步骤 2：调用 withTimeout（一个立即兑现的 promise）
    const value = await withTimeout(Promise.resolve("ok"), 1000);

    // 步骤 3：断言返回值逐值对账——原样带回
    expect(value).toBe("ok");
  });

});
