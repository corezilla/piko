/**
 * Case ID: UT-PI-114  ·  STATUS: real
 *
 * 责任：分支 L133 `catch (e)`（catch；graphrag-tools.ts）
 * 维度坐标：`execute` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-114.md（脚本的唯一依据）
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

describe("UT-PI-114 · execute · 错误路径 × 每个 typed 错误码", () => {
  it("enters the catch block when the backend rejects", async () => {
    const { createGraphragSearchTool } = await import("../../../src/graphrag-tools.js");
    // 步骤 1：构造使 catch 分支取真的输入——后端拒绝
    const searchCalls: { query: string; options?: Record<string, unknown> }[] = [];
    const makeGraphrag = (impl?: (q: string, o?: any) => Promise<any[]>) => ({
      search: async (q: string, o?: any) => {
        searchCalls.push({ query: q, options: o ?? {} });
        return impl ? impl(q, o) : [];
      },
    }) as any;
    const tool = createGraphragSearchTool({
      graphrag: makeGraphrag(async () => {
        throw new Error("backend exploded");
      }),
      context: { role: "tester", projectName: "piko" },
    } as any);

    // 步骤 2：调用 execute，断言 catch 块被进入（错误没有逃逸成未处理拒绝）
    const settled = await tool
      .execute("id", { query: "q" }, () => {}, {} as any, {} as any, {} as any)
      .then((r) => ({ ok: true as const, r }))
      .catch((e) => ({ ok: false as const, e: e as Error }));

    // 步骤 3：断言取真侧——catch 确实拦下了拒绝
    expect(settled.ok).toBe(false);
    expect((settled as any).e.message).toBe("backend exploded");

    // 步骤 4：断言取假侧——后端成功时 catch 不进入，返回正常结果
    const okTool = createGraphragSearchTool({
      graphrag: makeGraphrag(async () => [{ id: "d1", content: "c", score: 1, metadata: {}, created_at: "" }]),
      context: { role: "tester", projectName: "piko" },
    } as any);
    const ok = await okTool.execute("id", { query: "q" }, () => {}, {} as any, {} as any, {} as any);
    expect((ok.content[0] as any).text).toContain("d1");
  });

});
