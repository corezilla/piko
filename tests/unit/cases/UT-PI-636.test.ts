/**
 * Case ID: UT-PI-636  ·  STATUS: real
 *
 * 责任：返回站点 L245 值 `suffix ? `- "${text}" (${suffix})` : `-…` 逐值断言（skill-prefetch.ts）
 * 维度坐标：`renderMemoryEntry` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-636.md（脚本的唯一依据）
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

describe("UT-PI-636 · renderMemoryEntry · 纯函数/无副作用 × 每等价类合法值", () => {
  it("renders the suffix when there is one", async () => {
    // 步骤 2：调用 renderMemoryEntry（带日期与标签）
    const line = renderMemoryEntry({
      id: "m1",
      memory: "x",
      created_at: "2026-11-09T00:00:00.000Z",
      metadata: { tags: ["t"] },
    } as never);

    // 步骤 3：断言返回值逐值对账——后缀拼在正文后面
    expect(line).toBe('- "x" (2026-11-09, t)');
  });

});
