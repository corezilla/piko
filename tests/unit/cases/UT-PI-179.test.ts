/**
 * Case ID: UT-PI-179  ·  STATUS: real
 *
 * 责任：可选参数 `cause` 缺省/显式两态（mem0-client.ts:24）
 * 维度坐标：`Mem0ApiError.constructor` × `纯函数/无副作用` × `未知枚举`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-179.md（脚本的唯一依据）
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

describe("UT-PI-179 · Mem0ApiError.constructor · 纯函数/无副作用 × 未知枚举", () => {
  it("defaults the cause to undefined", async () => {
    // 步骤 2：构造 Mem0ApiError（不传 cause）
    const error = new Mem0ApiError(0, "network", "search failed");

    // 步骤 3：断言返回值逐值对账——可选参数缺省即 undefined
    expect(error.cause).toBeUndefined();
  });

});
