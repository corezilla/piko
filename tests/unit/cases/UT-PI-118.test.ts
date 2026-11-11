/**
 * Case ID: UT-PI-118  ·  STATUS: real
 *
 * 责任：返回站点 L135 值 `{ content: [{ type: "text", text: `doc …` 逐值断言（graphrag-tools.ts）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-118.md（脚本的唯一依据）
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

describe("UT-PI-118 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the fallback payload for a typed backend error", async () => {
    const { createGraphragSearchTool } = await import("../../../src/graphrag-tools.js");
    const { GraphRAGApiError } = await import("../../../src/graphrag-client.js");
    // 步骤 1：构造使 L135 返回站点被到达的输入——后端以 typed 错误拒绝
    const searchCalls: { query: string; options?: Record<string, unknown> }[] = [];
    const makeGraphrag = (impl?: (q: string, o?: any) => Promise<any[]>) => ({
      search: async (q: string, o?: any) => {
        searchCalls.push({ query: q, options: o ?? {} });
        return impl ? impl(q, o) : [];
      },
    }) as any;
    const tool = createGraphragSearchTool({
      graphrag: makeGraphrag(async () => {
        throw new GraphRAGApiError(0, "network", "connection refused");
      }),
      context: { role: "tester", projectName: "piko" },
    } as any);

    // 步骤 2：调用 execute，取返回值
    const result = await tool.execute(
      "id",
      { query: "q", scope: "docs" },
      () => {},
      {} as any,
      {} as any,
      {} as any,
    );

    // 步骤 3：断言返回值逐值对账——fallback 文本带出语义码，details 带出 code/status/scope
    expect(result.content.length).toBe(1);
    expect((result.content[0] as any).type).toBe("text");
    expect((result.content[0] as any).text).toBe("doc search unavailable: network");
    expect((result.details as any).error).toBe("network");
    expect((result.details as any).status).toBe(0);
    expect((result.details as any).scope).toBe("docs");
    expect((result.details as any).count).toBeUndefined();
  });

});
