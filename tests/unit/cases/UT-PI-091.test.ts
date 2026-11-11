/**
 * Case ID: UT-PI-091  ·  STATUS: real
 *
 * 责任：参数 `deps: DocSearchToolDeps` 的 `边界(上/下/零/空/满)` 类（graphrag-tools.ts:109）
 * 维度坐标：`createGraphragSearchTool` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-091.md（脚本的唯一依据）
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

describe("UT-PI-091 · createGraphragSearchTool · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("accepts boundary-shaped deps", async () => {
    const { createGraphragSearchTool } = await import("../../../src/graphrag-tools.js");
    // 步骤 1：构造边界形态的 deps——最小合法 projectName（单字符）、带 taskId、
    //         scope 长度上限 128 的角色名；以及 graphrag 替身
    const searchCalls: { query: string; options?: Record<string, unknown> }[] = [];
    const makeGraphrag = (impl?: (q: string, o?: any) => Promise<any[]>) => ({
      search: async (q: string, o?: any) => {
        searchCalls.push({ query: q, options: o ?? {} });
        return impl ? impl(q, o) : [];
      },
    }) as any;
    const minimal = createGraphragSearchTool({
      graphrag: makeGraphrag(),
      context: { role: "a", projectName: "a" },
    } as any);
    const withTask = createGraphragSearchTool({
      graphrag: makeGraphrag(),
      context: { role: "r".repeat(128), projectName: "p".repeat(128), taskId: "t-1" },
    } as any);

    // 步骤 2：调用 createGraphragSearchTool（两个边界输入）

    // 步骤 3：断言返回值逐值对账——边界值全部被接受，无长度上限校验
    expect(minimal.name).toBe("graphrag_search");
    expect(withTask.name).toBe("graphrag_search");
    expect(withTask.description).toBe(minimal.description);
  });

});
