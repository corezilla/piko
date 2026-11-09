/**
 * Case ID: UT-PI-629  ·  STATUS: real
 *
 * 责任：参数 `entry: Mem0SearchResult` 的 `边界(上/下/零/空/满)` 类（skill-prefetch.ts:240）
 * 维度坐标：`renderMemoryEntry` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-629.md（脚本的唯一依据）
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

describe("UT-PI-629 · renderMemoryEntry · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("renders an entry with no date and no tags", async () => {
    // 步骤 2：调用 renderMemoryEntry（没有日期也没有标签）
    const line = renderMemoryEntry({ id: "m1", memory: "bare" } as never);

    // 步骤 3：断言返回值逐值对账——没有后缀就只留正文
    expect(line).toBe('- "bare"');
  });

});
