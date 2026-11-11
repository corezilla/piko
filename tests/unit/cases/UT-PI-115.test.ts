/**
 * Case ID: UT-PI-115  ·  STATUS: real
 *
 * 责任：分支 L134 `if (e instanceof GraphRAGApiError)`（if；graphrag-tools.ts）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-115.md（脚本的唯一依据）
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

describe("UT-PI-115 · execute · 状态分支 × 合法迁移", () => {
  it("treats a typed error differently from a plain one", async () => {
    const { createGraphragSearchTool } = await import("../../../src/graphrag-tools.js");
    const { GraphRAGApiError } = await import("../../../src/graphrag-client.js");
    // 步骤 1：构造使 instanceof 取真的输入（GraphRAGApiError）与取假的输入（普通 Error）
    const searchCalls: { query: string; options?: Record<string, unknown> }[] = [];
    const makeGraphrag = (impl?: (q: string, o?: any) => Promise<any[]>) => ({
      search: async (q: string, o?: any) => {
        searchCalls.push({ query: q, options: o ?? {} });
        return impl ? impl(q, o) : [];
      },
    }) as any;
    const typedTool = createGraphragSearchTool({
      graphrag: makeGraphrag(async () => {
        throw new GraphRAGApiError(404, "not_found", "no index");
      }),
      context: { role: "tester", projectName: "piko" },
    } as any);
    const plainTool = createGraphragSearchTool({
      graphrag: makeGraphrag(async () => {
        throw new Error("plain");
      }),
      context: { role: "tester", projectName: "piko" },
    } as any);

    // 步骤 2：调用 execute，断言取真侧——typed 错误被转成 fallback
    const typed = await typedTool.execute("id", { query: "q" }, () => {}, {} as any, {} as any, {} as any);
    expect((typed.content[0] as any).text).toBe("doc search unavailable: not_found");
    expect((typed.details as any).error).toBe("not_found");

    // 步骤 3：构造使该分支取假的输入——普通 Error
    const plain = await plainTool
      .execute("id", { query: "q" }, () => {}, {} as any, {} as any, {} as any)
      .then(() => null)
      .catch((e) => e as Error);

    // 步骤 4：再次调用 execute，断言取假侧——不被转成 fallback，原样上抛
    expect(plain).toBeInstanceOf(Error);
    expect((plain as Error).message).toBe("plain");
  });

});
