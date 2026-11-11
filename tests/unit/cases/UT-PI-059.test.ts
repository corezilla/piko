/**
 * Case ID: UT-PI-059  ·  STATUS: real
 *
 * 责任：返回站点 L195 值 `hits.map((h) => { const src = h._source…` 逐值断言（graphrag-client.ts）
 * 维度坐标：`search` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-059.md（脚本的唯一依据）
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

describe("UT-PI-059 · search · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns one mapped result per hit, preserving order", async () => {
    // 步骤 1：构造含两条命中的响应体，使 map 的返回站点被到达
    const payload = {
      hits: {
        hits: [
          { _id: "d1", _score: 0.9, _source: { content: "first", metadata: { n: 1 }, created_at: "2026-01-01" } },
          { _id: "d2", _score: 0.4, _source: { content: "second", metadata: { n: 2 }, created_at: "2026-01-02" } },
        ],
      },
    };
    const respond = () => new Response(JSON.stringify(payload), { status: 200 });
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetch = vi.fn(async (input: unknown, init?: RequestInit) => {
      calls.push({ url: String(input), init });
      return respond();
    });
    vi.stubGlobal("fetch", fetch as unknown as typeof fetch);
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 2：调用 search，取返回值
      const results = await adapter.search("q");

      // 步骤 3：断言返回值逐值对账——条数与顺序都与命中一致
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
      expect(results.map((r) => r.id)).toEqual(["d1", "d2"]);
      expect(results.map((r) => r.content)).toEqual(["first", "second"]);
      expect(results.map((r) => r.score)).toEqual([0.9, 0.4]);
      expect(results[0]!.metadata).toEqual({ n: 1 });
      expect(results[0]!.created_at).toBe("2026-01-01");
    } finally {
      vi.unstubAllGlobals();
    }
  });

});
