/**
 * Case ID: UT-PI-634  ·  STATUS: real
 *
 * 责任：分支 L243 `entry.metadata?.tags`（?.；skill-prefetch.ts）
 * 维度坐标：`renderMemoryEntry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-634.md（脚本的唯一依据）
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

describe("UT-PI-634 · renderMemoryEntry · 状态分支 × 合法迁移", () => {
  it("renders no tags when the metadata has none", async () => {
    // 步骤 2：调用 renderMemoryEntry（metadata 里没有 tags）
    const line = renderMemoryEntry({ id: "m1", memory: "x", metadata: {} } as never);

    // 步骤 3：断言返回值逐值对账——可选链取空即没有标签
    expect(line).toBe('- "x"');
  });

});
