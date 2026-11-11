/**
 * Case ID: UT-PI-116  ·  STATUS: real
 *
 * 责任：throw L140 `reject`（守卫 `catch`；graphrag-tools.ts）
 * 维度坐标：`execute` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-116.md（脚本的唯一依据）
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

describe("UT-PI-116 · execute · 错误路径 × 每个 typed 错误码", () => {
  it("rethrows a non-typed error unchanged", async () => {
    const { createGraphragSearchTool } = await import("../../../src/graphrag-tools.js");
    // 步骤 1：构造触发 graphrag-tools.ts:140 处 throw 的输入——非 typed 的错误
    const searchCalls: { query: string; options?: Record<string, unknown> }[] = [];
    const makeGraphrag = (impl?: (q: string, o?: any) => Promise<any[]>) => ({
      search: async (q: string, o?: any) => {
        searchCalls.push({ query: q, options: o ?? {} });
        return impl ? impl(q, o) : [];
      },
    }) as any;
    const original = new Error("internal detail");
    const tool = createGraphragSearchTool({
      graphrag: makeGraphrag(async () => {
        throw original;
      }),
      context: { role: "tester", projectName: "piko" },
    } as any);

    // 步骤 2：调用 execute
    const err = await tool
      .execute("id", { query: "q" }, () => {}, {} as any, {} as any, {} as any)
      .then(() => null)
      .catch((e) => e as Error);

    // 步骤 3：断言消息可判别，且无部分写入——没有返回任何结果
    expect(err).toBe(original);
    expect((err as Error).message).toBe("internal detail");

    // 步骤 4：断言内部错误保真传播——没有被换成客户端码
    expect((err as any).code).toBeUndefined();
    expect((err as any).details).toBeUndefined();
  });

});
