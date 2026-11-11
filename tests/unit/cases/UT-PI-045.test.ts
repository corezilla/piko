/**
 * Case ID: UT-PI-045  ·  STATUS: real
 *
 * 责任：分支 L196 `h._source ?? {}`（??；graphrag-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-045.md（脚本的唯一依据）
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

describe("UT-PI-045 · search · 状态分支 × 合法迁移", () => {
  it("uses _source when the hit carries one and defaults to an empty object otherwise", async () => {
    // 步骤 1：构造带 _source 的命中（取真侧）与不带 _source 的命中（取假侧）
    const withSource = {
      hits: { hits: [{ _id: "d1", _score: 1, _source: { content: "body", metadata: { a: 1 }, created_at: "2026-01-01" } }] },
    };
    const withoutSource = { hits: { hits: [{ _id: "d2", _score: 1 }] } };
    let payload: unknown = withSource;
    const respond = () => new Response(JSON.stringify(payload), { status: 200 });
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetch = vi.fn(async (input: unknown, init?: RequestInit) => {
      calls.push({ url: String(input), init });
      return respond();
    });
    vi.stubGlobal("fetch", fetch as unknown as typeof fetch);
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 2：调用 search，断言取真侧——内容来自 _source
      const hit = await adapter.search("q");
      expect(hit[0]!.content).toBe("body");
      expect(hit[0]!.metadata).toEqual({ a: 1 });
      expect(hit[0]!.created_at).toBe("2026-01-01");

      // 步骤 3：构造使该分支取假的输入——命中不带 _source
      payload = withoutSource;

      // 步骤 4：再次调用 search，断言取假侧——src 退化为 {}，块内字段全为空
      const bare = await adapter.search("q");
      expect(bare[0]!.content).toBe("");
      expect(bare[0]!.metadata).toEqual({});
      expect(bare[0]!.created_at).toBe("");
      expect(calls.length).toBe(2);
    } finally {
      vi.unstubAllGlobals();
    }
  });

});
