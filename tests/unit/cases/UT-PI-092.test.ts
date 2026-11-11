/**
 * Case ID: UT-PI-092  ·  STATUS: real
 *
 * 责任：参数 `deps: DocSearchToolDeps` 的 `非法值` 类（graphrag-tools.ts:109）
 * 维度坐标：`createGraphragSearchTool` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-092.md（脚本的唯一依据）
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

describe("UT-PI-092 · createGraphragSearchTool · 纯函数/无副作用 × 非法值", () => {
  it("rejects a deps whose role is empty", async () => {
    const { createGraphragSearchTool } = await import("../../../src/graphrag-tools.js");
    // 步骤 1：构造非法 deps——context.role 为空串（触发 role required）
    const searchCalls: { query: string; options?: Record<string, unknown> }[] = [];
    const makeGraphrag = (impl?: (q: string, o?: any) => Promise<any[]>) => ({
      search: async (q: string, o?: any) => {
        searchCalls.push({ query: q, options: o ?? {} });
        return impl ? impl(q, o) : [];
      },
    }) as any;
    const deps = { graphrag: makeGraphrag(), context: { role: "", projectName: "piko" } };

    // 步骤 2：调用 createGraphragSearchTool
    const err = (() => {
      try {
        createGraphragSearchTool(deps as any);
        return null;
      } catch (e) {
        return e as Error;
      }
    })();

    // 步骤 3：断言被拒绝时抛出可判别的错误，且无状态写／资源残留
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toBe("role required");
    expect(searchCalls.length).toBe(0);
  });

});
