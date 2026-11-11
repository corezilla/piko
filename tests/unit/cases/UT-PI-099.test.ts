/**
 * Case ID: UT-PI-099  ·  STATUS: real
 *
 * 责任：参数 `params: inferred` 的 `边界(上/下/零/空/满)` 类（graphrag-tools.ts:122）
 * 维度坐标：`execute` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-099.md（脚本的唯一依据）
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

describe("UT-PI-099 · execute · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("forwards boundary params values verbatim", async () => {
    const { createGraphragSearchTool } = await import("../../../src/graphrag-tools.js");
    // 步骤 1：构造 params 的边界形态——max_results 取下界 1 与上界 20，
    //         query 取 schema 上限 500 字符，scope 取上限 128 字符
    const searchCalls: { query: string; options: Record<string, any> }[] = [];
    const makeGraphrag = (impl?: (q: string, o?: any) => Promise<any[]>) => ({
      search: async (q: string, o?: any) => {
        searchCalls.push({ query: q, options: o ?? {} });
        return impl ? impl(q, o) : [];
      },
    }) as any;
    const tool = createGraphragSearchTool({
      graphrag: makeGraphrag(),
      context: { role: "tester", projectName: "piko" },
    } as any);

    // 步骤 2：调用 execute（两组边界值）
    await tool.execute("id", { query: "q", max_results: 1 }, () => {}, {} as any, {} as any, {} as any);
    await tool.execute(
      "id",
      { query: "q".repeat(500), max_results: 20, scope: "s".repeat(128) },
      () => {},
      {} as any,
      {} as any,
      {} as any,
    );

    // 步骤 3：断言返回值逐值对账——边界值被原样转发，无截断无拒绝
    expect(searchCalls.length).toBe(2);
    expect(searchCalls[0]!.options.max_results).toBe(1);
    expect(searchCalls[1]!.options.max_results).toBe(20);
    expect(searchCalls[1]!.query).toHaveLength(500);
    expect(searchCalls[1]!.options.scope).toHaveLength(128);
  });

});
