/**
 * Case ID: UT-PI-048  ·  STATUS: real
 *
 * 责任：分支 L200 `? typeof h._score === "number" :`（ternary；graphrag-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-048.md（脚本的唯一依据）
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

describe("UT-PI-048 · search · 状态分支 × 合法迁移", () => {
  it("keeps a numeric score and zeroes a non-numeric one", async () => {
    // 步骤 1：构造 _score 为数字的命中（取真侧）与为非数字的命中（取假侧）
    const numeric = { hits: { hits: [{ _id: "d1", _score: 0.75, _source: { content: "c" } }] } };
    const textual = { hits: { hits: [{ _id: "d1", _score: "high", _source: { content: "c" } }] } };
    let payload: unknown = numeric;
    const respond = () => new Response(JSON.stringify(payload), { status: 200 });
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetch = vi.fn(async (input: unknown, init?: RequestInit) => {
      calls.push({ url: String(input), init });
      return respond();
    });
    vi.stubGlobal("fetch", fetch as unknown as typeof fetch);
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 2：调用 search，断言取真侧——数字分原样带出
      const hit = await adapter.search("q");
      expect(hit[0]!.score).toBe(0.75);

      // 步骤 3：构造使该分支取假的输入——_score 是字符串
      payload = textual;

      // 步骤 4：再次调用 search，断言取假侧——分数退化为 0
      const bare = await adapter.search("q");
      expect(bare[0]!.score).toBe(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });

});
