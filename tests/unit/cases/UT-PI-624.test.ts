/**
 * Case ID: UT-PI-624  ·  STATUS: real
 *
 * 责任：资源操作 L231 `setTimeout`（skill-prefetch.ts）
 * 维度坐标：`withTimeout` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-624.md（脚本的唯一依据）
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

describe("UT-PI-624 · withTimeout · 资源获取/释放 × 获取失败路径", () => {
  it("rejects a promise that never settles", async () => {
    // 步骤 1：造一个永不兑现的 promise
    const never = new Promise<string>(() => {});

    // 步骤 2：调用 withTimeout（1ms 超时）
    // 步骤 3：断言被拒——超时由 setTimeout 触发
    await expect(withTimeout(never, 1)).rejects.toThrow(/prefetch timed out/);
  });

});
