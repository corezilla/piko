/**
 * Case ID: UT-PI-633  ·  STATUS: real
 *
 * 责任：分支 L243 `? Array.isArray(entry.metadata?.tags) :`（ternary；skill-prefetch.ts）
 * 维度坐标：`renderMemoryEntry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-633.md（脚本的唯一依据）
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

describe("UT-PI-633 · renderMemoryEntry · 状态分支 × 合法迁移", () => {
  it("joins the tags with a comma", async () => {
    // 步骤 2：调用 renderMemoryEntry（三个标签）
    const line = renderMemoryEntry({
      id: "m1",
      memory: "x",
      metadata: { tags: ["a", "b", "c"] },
    } as never);

    // 步骤 3：断言返回值逐值对账——标签用逗号加空格连起来
    expect(line).toBe('- "x" (a, b, c)');
  });

});
