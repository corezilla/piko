/**
 * Case ID: UT-PI-051  ·  STATUS: real
 *
 * 责任：分支 L214 `if (errBody.error?.reason)`（if；graphrag-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-051.md（脚本的唯一依据）
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

describe("UT-PI-051 · search · 状态分支 × 合法迁移", () => {
  it("prefers error.reason over error.message when the body carries a reason", async () => {
    // 步骤 1：构造错误体带 error.reason（取真侧）
    const withReason = { error: { reason: "index not found" } };
    const withMessage = { error: { type: "index_not_found_exception" }, message: "plain message" };
    let payload: unknown = withReason;
    const respond = () => new Response(JSON.stringify(payload), { status: 404, statusText: "Not Found" });
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetch = vi.fn(async (input: unknown, init?: RequestInit) => {
      calls.push({ url: String(input), init });
      return respond();
    });
    vi.stubGlobal("fetch", fetch as unknown as typeof fetch);
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 2：调用 search，断言取真侧——错误消息取自 error.reason
      const err = await adapter.search("q").catch((e) => e);
      expect(err).toBeInstanceOf(GraphRAGApiError);
      expect(err.message).toBe("index not found");

      // 步骤 3：构造使该分支取假的输入——error 存在但没有 reason
      payload = withMessage;

      // 步骤 4：再次调用 search，断言取假侧——落到 error.message 分支
      const err2 = await adapter.search("q").catch((e) => e);
      expect(err2.message).toBe("plain message");
    } finally {
      vi.unstubAllGlobals();
    }
  });

});
