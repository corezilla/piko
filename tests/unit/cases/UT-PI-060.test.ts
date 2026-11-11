/**
 * Case ID: UT-PI-060  ·  STATUS: real
 *
 * 责任：返回站点 L197 值 `{ id: h._id ?? "", content: src.content…` 逐值断言（graphrag-client.ts）
 * 维度坐标：`search` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-060.md（脚本的唯一依据）
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

describe("UT-PI-060 · search · 纯函数/无副作用 × 每等价类合法值", () => {
  it("maps a hit onto the documented result shape", async () => {
    // 步骤 1：构造一条完整命中的响应体
    const payload = {
      hits: { hits: [{ _id: "chunk-9", _score: 1.25, _source: { content: "text", metadata: { source: "a.md" }, created_at: "2026-03-04" } }] },
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

      // 步骤 3：断言返回值逐值对账——字段名与取值全部对上
      expect(results.length).toBe(1);
      expect(results[0]).toEqual({
        id: "chunk-9",
        content: "text",
        score: 1.25,
        metadata: { source: "a.md" },
        created_at: "2026-03-04",
      });
      expect(Object.keys(results[0]!).sort()).toEqual(
        ["content", "created_at", "id", "metadata", "score"],
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

});
