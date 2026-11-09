/**
 * Case ID: UT-PI-632  ·  STATUS: real
 *
 * 责任：分支 L242 `? entry.created_at :`（ternary；skill-prefetch.ts）
 * 维度坐标：`renderMemoryEntry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-632.md（脚本的唯一依据）
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

describe("UT-PI-632 · renderMemoryEntry · 状态分支 × 合法迁移", () => {
  it("cuts the date to its day", async () => {
    // 步骤 2：调用 renderMemoryEntry（带完整时间戳）
    const line = renderMemoryEntry({
      id: "m1",
      memory: "x",
      created_at: "2026-11-09T10:20:30.000Z",
    } as never);

    // 步骤 3：断言返回值逐值对账——日期只到日
    expect(line).toBe('- "x" (2026-11-09)');
  });

});
