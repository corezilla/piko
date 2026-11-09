/**
 * Case ID: UT-PI-171  ·  STATUS: real
 *
 * 责任：参数 `code: string` 的 `超长` 类（mem0-client.ts:24）
 * 维度坐标：`Mem0ApiError.constructor` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-171.md（脚本的唯一依据）
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

describe("UT-PI-171 · Mem0ApiError.constructor · 字符串/路径/枚举输入 × 超长", () => {
  it("carries an over-long code", async () => {
    // 步骤 2：构造 Mem0ApiError（超长语义码）
    const error = new Mem0ApiError(500, "c".repeat(10000), "boom");

    // 步骤 3：断言返回值逐值对账——该参数不校验长度
    expect(error.code).toHaveLength(10000);
  });

});
