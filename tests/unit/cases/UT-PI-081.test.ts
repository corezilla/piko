/**
 * Case ID: UT-PI-081  ·  STATUS: real
 *
 * 责任：分支 L97 `if (status === 429)`（if；graphrag-client.ts）
 * 维度坐标：`mapStatusToCode` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-081.md（脚本的唯一依据）
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
import {
  Mem0Adapter,
  Mem0ApiError,
  mapStatusToCode as mapMem0Status,
} from "../../../src/mem0-client.js";
import {
  GraphRAGAdapter,
  GraphRAGApiError,
  mapStatusToCode as mapGraphragStatus,
} from "../../../src/graphrag-client.js";
import { fakeFetch } from "./support/pi-fix.js";

describe("UT-PI-081 · mapStatusToCode · 状态分支 × 合法迁移", () => {
  it("returns rate_limited for 429 and something else for a non-429 status", async () => {
    // 步骤 1：构造使分支取真的 status＝429 与取假的 status＝428
    const taken = 429;
    const notTaken = 428;

    // 步骤 2：调用 mapStatusToCode，断言取真侧
    expect(mapGraphragStatus(taken)).toBe("rate_limited");

    // 步骤 3：构造使该分支取假的输入
    expect(mapGraphragStatus(notTaken)).not.toBe("rate_limited");

    // 步骤 4：再次调用 mapStatusToCode，断言取假侧
    expect(mapGraphragStatus(notTaken)).toBe("server_error");
  });

});
