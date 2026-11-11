/**
 * Case ID: UT-PI-057  ·  STATUS: real
 *
 * 责任：throw L177 `reject`（守卫 `catch`；graphrag-client.ts）
 * 维度坐标：`search` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-057.md（脚本的唯一依据）
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

describe("UT-PI-057 · search · 错误路径 × 每个 typed 错误码", () => {
  it("wraps a network rejection as a typed GraphRAGApiError with status 0", async () => {
    // 步骤 1：构造使 fetch 拒绝的输入
    const boom = new Error("socket hang up");
    const fetch = vi.fn(async () => {
      throw boom;
    });
    vi.stubGlobal("fetch", fetch as unknown as typeof fetch);
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 2：调用 search，断言抛出 typed 错误且 code 逐值等于 "network"
      const err = await adapter.search("q").catch((e) => e);
      expect(err).toBeInstanceOf(GraphRAGApiError);
      expect(err.status).toBe(0);
      expect(err.code).toBe("network");

      // 步骤 3：断言消息可判别、含原始错误，且无部分写入
      expect(err.message).toContain("search failed");
      expect(err.message).toContain("socket hang up");

      // 步骤 4：断言内部错误保真传播——原始错误被挂在 cause 上
      expect(err.cause).toBe(boom);
    } finally {
      vi.unstubAllGlobals();
    }
  });

});
