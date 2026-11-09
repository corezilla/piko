/**
 * Case ID: UT-PI-630  ·  STATUS: real
 *
 * 责任：参数 `entry: Mem0SearchResult` 的 `非法值` 类（skill-prefetch.ts:240）
 * 维度坐标：`renderMemoryEntry` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-630.md（脚本的唯一依据）
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

describe("UT-PI-630 · renderMemoryEntry · 纯函数/无副作用 × 非法值", () => {
  it("does not validate the entry", async () => {
    // 步骤 2：调用 renderMemoryEntry（entry 是字符串）
    const line = renderMemoryEntry("not-an-entry" as never);

    // 步骤 3：断言返回值逐值对账——该参数不校验，正文回退到空串
    expect(line).toBe('- ""');
  });

});
