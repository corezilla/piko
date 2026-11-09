/**
 * Case ID: UT-PI-623  ·  STATUS: real
 *
 * 责任：参数 `ms: number` 的 `−1 通过` 类（skill-prefetch.ts:229）
 * 维度坐标：`withTimeout` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-623.md（脚本的唯一依据）
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

describe("UT-PI-623 · withTimeout · 数值/长度上限参数 × −1 通过", () => {
  it("rejects just past the timeout boundary", async () => {
    // 步骤 1：造一个永不兑现的 promise
    const never = new Promise<string>(() => {});

    // 步骤 2：调用 withTimeout（1ms 超时）
    // 步骤 3：断言被拒——超时边界外
    await expect(withTimeout(never, 1)).rejects.toThrow(/timed out/);
  });

});
