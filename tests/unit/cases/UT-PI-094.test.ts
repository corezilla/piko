/**
 * Case ID: UT-PI-094  ·  STATUS: real
 *
 * 责任：返回站点 L117 值 `{ name: "graphrag_search", label: "Grap…` 逐值断言（graphrag-tools.ts）
 * 维度坐标：`createGraphragSearchTool` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-094.md（脚本的唯一依据）
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

describe("UT-PI-094 · createGraphragSearchTool · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the documented tool descriptor", async () => {
    const { createGraphragSearchTool } = await import("../../../src/graphrag-tools.js");
    // 步骤 1：构造使返回站点被到达的输入——合法的 deps
    const searchCalls: { query: string; options?: Record<string, unknown> }[] = [];
    const makeGraphrag = (impl?: (q: string, o?: any) => Promise<any[]>) => ({
      search: async (q: string, o?: any) => {
        searchCalls.push({ query: q, options: o ?? {} });
        return impl ? impl(q, o) : [];
      },
    }) as any;
    const deps = { graphrag: makeGraphrag(), context: { role: "tester", projectName: "piko" } };

    // 步骤 2：调用 createGraphragSearchTool，取返回值
    const tool = createGraphragSearchTool(deps as any);

    // 步骤 3：断言返回值逐值对账——站点 L117 返回的字段逐个对上
    expect(tool.name).toBe("graphrag_search");
    expect(tool.label).toBe("GraphRAG search");
    expect(tool.description).toContain("document corpus");
    expect((tool.parameters as any).type).toBe("object");
    expect(Object.keys((tool.parameters as any).properties).sort()).toEqual(
      ["max_results", "query", "scope"],
    );
  });

});
