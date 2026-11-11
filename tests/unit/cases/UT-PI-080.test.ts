/**
 * Case ID: UT-PI-080  ·  STATUS: real
 *
 * 责任：分支 L96 `if (status === 404)`（if；graphrag-client.ts）
 * 维度坐标：`mapStatusToCode` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-080.md（脚本的唯一依据）
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

describe("UT-PI-080 · mapStatusToCode · 状态分支 × 合法迁移", () => {
  it("returns not_found for 404 and something else for a non-404 status", async () => {
    // 步骤 1：构造使分支取真的 status＝404 与取假的 status＝403
    const taken = 404;
    const notTaken = 403;

    // 步骤 2：调用 mapStatusToCode，断言取真侧
    expect(mapGraphragStatus(taken)).toBe("not_found");

    // 步骤 3：构造使该分支取假的输入
    expect(mapGraphragStatus(notTaken)).not.toBe("not_found");

    // 步骤 4：再次调用 mapStatusToCode，断言取假侧——403 落到自己的分支
    expect(mapGraphragStatus(notTaken)).toBe("auth_forbidden");
  });

});
