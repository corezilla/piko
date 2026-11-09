/**
 * Case ID: UT-PI-638  ·  STATUS: real
 *
 * 责任：参数 `entry: GraphRAGSearchResult` 的 `边界(上/下/零/空/满)` 类（skill-prefetch.ts:249）
 * 维度坐标：`renderDocEntry` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-638.md（脚本的唯一依据）
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

describe("UT-PI-638 · renderDocEntry · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("renders a doc with only an id", async () => {
    // 步骤 2：调用 renderDocEntry（没有 metadata）
    const line = renderDocEntry({ id: "d1", content: "body" } as never);

    // 步骤 3：断言返回值逐值对账——来源回退到 id
    expect(line).toBe("- d1: body");
  });

});
