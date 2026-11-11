/**
 * Case ID: UT-PI-056  ·  STATUS: real
 *
 * 责任：throw L135 `query required`（守卫 `if (!query || query.trim() === "")`；graphrag-client.ts）
 * 维度坐标：`search` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-056.md（脚本的唯一依据）
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

describe("UT-PI-056 · search · 错误路径 × 每个 typed 错误码", () => {
  it("rejects an empty query before touching the network", async () => {
    // 步骤 1：构造触发守卫的 query——空串与纯空白串都满足 query.trim() === ""
    const calls: unknown[] = [];
    const fetch = vi.fn(async (input: unknown) => {
      calls.push(input);
      return new Response("{}", { status: 200 });
    });
    vi.stubGlobal("fetch", fetch as unknown as typeof fetch);
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 2：调用 search，断言抛出普通 Error，消息逐值等于 "query required"
      const err = await adapter.search("").catch((e) => e);
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("query required");

      // 步骤 3：断言消息可判别，且无部分写入——一次网络请求都没发生
      const blank = await adapter.search("   ").catch((e) => e);
      expect(blank.message).toBe("query required");
      expect(calls.length).toBe(0);

      // 步骤 4：断言内部错误不上抛为客户端码——它不是 GraphRAGApiError，没有 code 字段
      expect(err).not.toBeInstanceOf(GraphRAGApiError);
      expect((err as { code?: string }).code).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
    }
  });

});
