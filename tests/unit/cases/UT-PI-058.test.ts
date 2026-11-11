/**
 * Case ID: UT-PI-058  ·  STATUS: real
 *
 * 责任：throw L219 `reject`（守卫 `unconditional`；graphrag-client.ts）
 * 维度坐标：`search` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-058.md（脚本的唯一依据）
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

describe("UT-PI-058 · search · 错误路径 × 每个 typed 错误码", () => {
  it("throws a typed GraphRAGApiError carrying the HTTP status and the mapped code", async () => {
    // 步骤 1：构造非 2xx 响应
    const respond = () => new Response(JSON.stringify({ message: "bad key" }), { status: 401, statusText: "Unauthorized" });
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetch = vi.fn(async (input: unknown, init?: RequestInit) => {
      calls.push({ url: String(input), init });
      return respond();
    });
    vi.stubGlobal("fetch", fetch as unknown as typeof fetch);
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 2：调用 search，断言抛出 typed 错误，code 由状态映射而来
      const err = await adapter.search("q").catch((e) => e);
      expect(err).toBeInstanceOf(GraphRAGApiError);
      expect(err.status).toBe(401);
      expect(err.code).toBe("auth_invalid");

      // 步骤 3：断言消息可判别，且无部分写入——没有返回任何结果
      expect(err.message).toBe("bad key");
      expect((err as { results?: unknown }).results).toBeUndefined();

      // 步骤 4：断言内部错误不上抛为客户端码——它就是对外的 typed 错误
      expect(err.name).toBe("GraphRAGApiError");
    } finally {
      vi.unstubAllGlobals();
    }
  });

});
