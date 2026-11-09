/**
 * Case ID: UT-PI-062  ·  STATUS: real
 *
 * 责任：参数 `status: number` 的 `+1 拒绝` 类（graphrag-client.ts:57）
 * 维度坐标：`GraphRAGApiError.constructor` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-062.md（脚本的唯一依据）
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

describe("UT-PI-062 · GraphRAGApiError.constructor · 数值/长度上限参数 × +1 拒绝", () => {
  it("carries a status past the HTTP range", async () => {
    // 步骤 2：构造 GraphRAGApiError（状态码 999）
    const error = new GraphRAGApiError(999, "server_error", "weird");

    // 步骤 3：断言返回值逐值对账——该参数不校验范围
    expect(error.status).toBe(999);
  });

});
