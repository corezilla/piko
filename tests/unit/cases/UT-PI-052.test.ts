/**
 * Case ID: UT-PI-052  ·  STATUS: real
 *
 * 责任：分支 L215 `if (errBody.message) errMessage = errBo…`（else；graphrag-client.ts）
 * 维度坐标：`search` × `状态分支` × `每个非法迁移拒绝`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-052.md（脚本的唯一依据）
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

describe("UT-PI-052 · search · 状态分支 × 每个非法迁移拒绝", () => {
  it("uses error.message when the body carries one and keeps statusText otherwise", async () => {
    // 步骤 1：构造错误体带 message（取真侧）
    const withMessage = { message: "index missing" };
    const withoutMessage = { other: "ignored" };
    let payload: unknown = withMessage;
    const respond = () => new Response(JSON.stringify(payload), { status: 500, statusText: "Internal Server Error" });
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetch = vi.fn(async (input: unknown, init?: RequestInit) => {
      calls.push({ url: String(input), init });
      return respond();
    });
    vi.stubGlobal("fetch", fetch as unknown as typeof fetch);
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 2：调用 search，断言取真侧——错误消息取自 error.message
      const err = await adapter.search("q").catch((e) => e);
      expect(err).toBeInstanceOf(GraphRAGApiError);
      expect(err.message).toBe("index missing");

      // 步骤 3：构造使该分支取假的输入——错误体没有 message
      payload = withoutMessage;

      // 步骤 4：再次调用 search，断言取假侧——错误消息退回 statusText
      const err2 = await adapter.search("q").catch((e) => e);
      expect(err2.message).toBe("Internal Server Error");
    } finally {
      vi.unstubAllGlobals();
    }
  });

});
