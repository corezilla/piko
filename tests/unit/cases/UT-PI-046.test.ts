/**
 * Case ID: UT-PI-046  ·  STATUS: real
 *
 * 责任：分支 L198 `h._id ?? ""`（??；graphrag-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-046.md（脚本的唯一依据）
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

describe("UT-PI-046 · search · 状态分支 × 合法迁移", () => {
  it("reads _id when the hit carries one and falls back to an empty id otherwise", async () => {
    // 步骤 1：构造带 _id 的命中（取真侧）与不带 _id 的命中（取假侧）
    const withId = { hits: { hits: [{ _id: "chunk-1", _source: { content: "c" } }] } };
    const withoutId = { hits: { hits: [{ _source: { content: "c" } }] } };
    let payload: unknown = withId;
    const respond = () => new Response(JSON.stringify(payload), { status: 200 });
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetch = vi.fn(async (input: unknown, init?: RequestInit) => {
      calls.push({ url: String(input), init });
      return respond();
    });
    vi.stubGlobal("fetch", fetch as unknown as typeof fetch);
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 2：调用 search，断言取真侧——id 取自 _id
      const hit = await adapter.search("q");
      expect(hit[0]!.id).toBe("chunk-1");

      // 步骤 3：构造使该分支取假的输入——命中不带 _id
      payload = withoutId;

      // 步骤 4：再次调用 search，断言取假侧——id 退化为空串
      const bare = await adapter.search("q");
      expect(bare[0]!.id).toBe("");
    } finally {
      vi.unstubAllGlobals();
    }
  });

});
