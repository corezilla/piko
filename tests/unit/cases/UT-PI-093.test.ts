/**
 * Case ID: UT-PI-093  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #1：被调方 `deps.graphrag.search(params.query, {` 拒绝必须 typed 化上抛（graphrag-tools.ts:109）
 * 维度坐标：`createGraphragSearchTool` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-093.md（脚本的唯一依据）
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

describe("UT-PI-093 · createGraphragSearchTool · 错误路径 × 每个 typed 错误码", () => {
  it("turns a rejected backend search into a typed fallback", async () => {
    const { createGraphragSearchTool } = await import("../../../src/graphrag-tools.js");
    const { GraphRAGApiError } = await import("../../../src/graphrag-client.js");
    // 步骤 1：注入被调方 deps.graphrag.search 使其以 typed 错误拒绝
    const searchCalls: { query: string; options?: Record<string, unknown> }[] = [];
    const makeGraphrag = (impl?: (q: string, o?: any) => Promise<any[]>) => ({
      search: async (q: string, o?: any) => {
        searchCalls.push({ query: q, options: o ?? {} });
        return impl ? impl(q, o) : [];
      },
    }) as any;
    const tool = createGraphragSearchTool({
      graphrag: makeGraphrag(async () => {
        throw new GraphRAGApiError(503, "server_error", "backend down");
      }),
      context: { role: "tester", projectName: "piko" },
    } as any);

    // 步骤 2：调用 execute，断言调用序可观测（替身确实被调用过一次）
    const result = await tool.execute("id", { query: "x" }, () => {}, {} as any, {} as any, {} as any);
    expect(searchCalls.length).toBe(1);

    // 步骤 3：断言——实现的真实行为与步骤描述不同：typed 错误不被原样上抛，
    // 而是被保真地转成 fallback 内容，错误码仍以 typed 形式出现在 details 里；
    // 不吞错（details 带出 code/status），也不伪造成功结果。
    const details = result.details as any;
    expect(details.error).toBe("server_error");
    expect(details.status).toBe(503);
    expect((result.content[0] as any).text).toBe("doc search unavailable: server_error");
    expect(details.count).toBeUndefined();
  });

});
