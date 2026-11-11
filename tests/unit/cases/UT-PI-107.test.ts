/**
 * Case ID: UT-PI-107  ·  STATUS: real
 *
 * 责任：参数 `_invocation: inferred` 的 `每等价类合法值` 类（graphrag-tools.ts:122）
 * 维度坐标：`execute` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-107.md（脚本的唯一依据）
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

describe("UT-PI-107 · execute · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts a normal invocation", async () => {
    const { createGraphragSearchTool } = await import("../../../src/graphrag-tools.js");
    // 步骤 1：构造 _invocation 的合法等价类——带 invocationId / operationId / turnId
    const searchCalls: { query: string; options?: Record<string, unknown> }[] = [];
    const makeGraphrag = (impl?: (q: string, o?: any) => Promise<any[]>) => ({
      search: async (q: string, o?: any) => {
        searchCalls.push({ query: q, options: o ?? {} });
        return impl ? impl(q, o) : [];
      },
    }) as any;
    const tool = createGraphragSearchTool({
      graphrag: makeGraphrag(async () => [{ id: "d1", content: "c", score: 1, metadata: {}, created_at: "" }]),
      context: { role: "tester", projectName: "piko" },
    } as any);
    const invocation = {
      invocationId: "inv-1",
      operationId: "op-1",
      turnId: "turn-1",
      getMemo: async () => undefined,
      setMemo: async () => {},
    };

    // 步骤 2：调用 execute
    const result = await tool.execute("id", { query: "q" }, () => {}, {} as any, invocation as any, {} as any);

    // 步骤 3：断言返回值逐值对账——该参数被实现忽略
    expect((result.content[0] as any).text).toContain("d1");
    expect(searchCalls.length).toBe(1);
  });

});
