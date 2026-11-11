/**
 * Case ID: UT-PI-113  ·  STATUS: real
 *
 * 责任：分支 L123 `params.scope ?? "all"`（??；graphrag-tools.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-113.md（脚本的唯一依据）
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

describe("UT-PI-113 · execute · 状态分支 × 合法迁移", () => {
  it("echoes the scope when given and falls back to all otherwise", async () => {
    const { createGraphragSearchTool } = await import("../../../src/graphrag-tools.js");
    // 步骤 1：构造使 ?? 取真的输入（params.scope 有值）与取假的输入（scope 缺省）
    const searchCalls: { query: string; options?: Record<string, unknown> }[] = [];
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

    // 步骤 2：调用 execute，断言取真侧——details.scope 回显传入的 scope
    const withScope = await tool.execute(
      "id",
      { query: "q", scope: "piko-design-docs" },
      () => {},
      {} as any,
      {} as any,
      {} as any,
    );
    expect((withScope.details as any).scope).toBe("piko-design-docs");

    // 步骤 3：构造使该分支取假的输入——scope 缺省
    const withoutScope = await tool.execute("id", { query: "q" }, () => {}, {} as any, {} as any, {} as any);

    // 步骤 4：再次调用 execute，断言取假侧——scope 退化为 "all"
    expect((withoutScope.details as any).scope).toBe("all");
  });

});
