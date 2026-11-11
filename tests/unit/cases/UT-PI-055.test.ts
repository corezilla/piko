/**
 * Case ID: UT-PI-055  ·  STATUS: real
 *
 * 责任：分支 L216 `catch ()`（catch；graphrag-client.ts）
 * 维度坐标：`search` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-055.md（脚本的唯一依据）
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

describe("UT-PI-055 · search · 错误路径 × 每个 typed 错误码", () => {
  it("falls back to statusText when the error body is not JSON and uses the body when it is", async () => {
    // 步骤 1：构造非 JSON 的错误体（使 catch 取真）
    const respond = () => new Response("not json at all", { status: 400, statusText: "Bad Request" });
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetch = vi.fn(async (input: unknown, init?: RequestInit) => {
      calls.push({ url: String(input), init });
      return respond();
    });
    vi.stubGlobal("fetch", fetch as unknown as typeof fetch);
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 2：调用 search，断言取真侧——JSON 解析失败被 catch，消息退回 statusText
      const err = await adapter.search("q").catch((e) => e);
      expect(err).toBeInstanceOf(GraphRAGApiError);
      expect(err.status).toBe(400);
      expect(err.code).toBe("server_error");
      expect(err.message).toBe("Bad Request");

      // 步骤 3：构造使该分支取假的输入——错误体是合法 JSON
      const jsonResponder = () => new Response(JSON.stringify({ message: "structured" }), { status: 400, statusText: "Bad Request" });
      const jsonFetch = vi.fn(async () => jsonResponder());
      vi.stubGlobal("fetch", jsonFetch as unknown as typeof fetch);

      // 步骤 4：再次调用 search，断言取假侧——错误消息取自 JSON 体
      const err2 = await adapter.search("q").catch((e) => e);
      expect(err2.message).toBe("structured");
    } finally {
      vi.unstubAllGlobals();
    }
  });

});
