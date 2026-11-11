/**
 * Case ID: UT-PI-010  ·  STATUS: real
 *
 * 责任：`prefetchSkillContext` × `字符串/路径/枚举输入` × `注入字符`（波次一粗粒度登记；skill-prefetch.ts:137）
 * 维度坐标：`prefetchSkillContext` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-010.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import {
  DEFAULT_PREFETCH_MAX_RESULTS,
  DEFAULT_PREFETCH_TIMEOUT_MS,
  MAX_QUERY_CHARS,
  clearPrefetchCache,
  prefetchCacheSize,
  prefetchSkillContext,
} from "../../../src/skill-prefetch.js";
import type { Mem0Adapter } from "../../../src/mem0-client.js";
import type { GraphRAGAdapter } from "../../../src/graphrag-client.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-010 · prefetchSkillContext · 字符串/路径/枚举输入 × 注入字符", () => {
  it("passes injected query characters to both backends verbatim and caps them", async () => {  // passes injected query characters to both backends verbatim and caps them
    vi.useFakeTimers();
    clearPrefetchCache();

    // 步骤 1：注入字符输入——路径穿越 + 控制字符 + SQL/命令元字符，拼接成超过上限的指令
    const injection = "../../etc/passwd ' OR 1=1 -- \u0000\u0007; rm -rf /";
    const instruction = injection.repeat(40);
    const capped = instruction.slice(0, MAX_QUERY_CHARS);
    expect(instruction.length).toBeGreaterThan(MAX_QUERY_CHARS);
    expect(capped.length).toBe(MAX_QUERY_CHARS);

    const memorySearch = vi.fn(
      async (_query: string, _userId: string, _options?: { max_results?: number }) => [
        { id: "m1", memory: "prior", score: 0.9, metadata: {}, created_at: "2026-01-02T03:04:05Z" },
      ],
    );
    const docsSearch = vi.fn(async (_query: string, _options?: { scope?: string; max_results?: number }) => [
      { id: "d1", content: "doc", score: 0.8, metadata: {}, created_at: "2026-01-02T03:04:05Z" },
    ]);
    const mem0 = { search: memorySearch } as unknown as Mem0Adapter;
    const graphrag = { search: docsSearch } as unknown as GraphRAGAdapter;
    const identity = { role: "tester", userId: "tester:piko", defaultScope: "default" };

    // 步骤 2/3：注入字符原样送达两个后端（不转义、不丢弃、不解析），只按上限截断
    const context = await prefetchSkillContext(instruction, identity, mem0, graphrag);
    expect(memorySearch).toHaveBeenCalledTimes(1);
    expect(memorySearch.mock.calls[0][0]).toBe(capped);
    expect(memorySearch.mock.calls[0][1]).toBe("tester:piko");
    expect(memorySearch.mock.calls[0][2]).toEqual({ max_results: DEFAULT_PREFETCH_MAX_RESULTS });
    expect(docsSearch).toHaveBeenCalledTimes(1);
    expect(docsSearch.mock.calls[0][0]).toBe(capped);
    expect(docsSearch.mock.calls[0][1]).toEqual({ scope: "default", max_results: DEFAULT_PREFETCH_MAX_RESULTS });
    expect(context.memoryQuery).toBe(capped);
    expect(context.docsQuery).toBe(capped);
    expect(context.memory).toHaveLength(1);
    expect(context.docs).toHaveLength(1);
    expect(context.sources).toEqual({ memory: "ok", docs: "ok" });
    expect(context.skipped).toBeUndefined();
    // 截断后的 query 里注入字符原样还在——没有被 URL / HTML / SQL 转义
    expect(context.memoryQuery).toContain("../../etc/passwd");
    expect(context.memoryQuery).toContain("' OR 1=1 --");
    expect(context.memoryQuery).not.toContain("%2e%2e");
    expect(context.memoryQuery).not.toContain("&lt;");

    // L147（?? 20）：trim 后不足 20 → short_instruction；正好 20 → 放行
    clearPrefetchCache();
    const shortSearch = vi.fn(async (_query: string, _userId: string, _options?: { max_results?: number }) => []);
    const shortMem0 = { search: shortSearch } as unknown as Mem0Adapter;
    const nineteen = "a".repeat(19);
    const shortContext = await prefetchSkillContext(nineteen, identity, shortMem0, undefined, { noCache: true });
    expect(shortContext.skipped).toBe("short_instruction");
    expect(shortContext.memoryQuery).toBe("");
    expect(shortContext.docsQuery).toBe("");
    expect(shortContext.sources).toEqual({ memory: "skipped", docs: "skipped" });
    expect(shortSearch).not.toHaveBeenCalled();

    const twenty = "a".repeat(20);
    const twentyContext = await prefetchSkillContext(twenty, identity, shortMem0, undefined, { noCache: true });
    expect(twentyContext.skipped).toBeUndefined();
    expect(twentyContext.memoryQuery).toBe(twenty);
    expect(shortSearch).toHaveBeenCalledTimes(1);

    // L146（?? 5）：显式覆盖后按显式值下发给后端
    const cappedSearch = vi.fn(async (_query: string, _userId: string, _options?: { max_results?: number }) => []);
    const cappedMem0 = { search: cappedSearch } as unknown as Mem0Adapter;
    await prefetchSkillContext(twenty, identity, cappedMem0, undefined, { maxResults: 2, noCache: true });
    expect(cappedSearch.mock.calls[0][2]).toEqual({ max_results: 2 });

    // L145（?? 1500）：默认超时正好 1500ms 挂起——1499ms 时未超时，第 1500ms 落定
    clearPrefetchCache();
    const hanging = {
      search: vi.fn(async (_query: string, _userId: string, _options?: { max_results?: number }) => new Promise<never>(() => {})),
    } as unknown as Mem0Adapter;
    let settled = false;
    const timed = prefetchSkillContext(twenty, identity, hanging, undefined, {
      timeoutMs: DEFAULT_PREFETCH_TIMEOUT_MS,
      noCache: true,
    });
    timed.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );
    await vi.advanceTimersByTimeAsync(DEFAULT_PREFETCH_TIMEOUT_MS - 1);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    const timedContext = await timed;
    expect(settled).toBe(true);
    expect(timedContext.sources.memory).toBe("unavailable");
    expect(timedContext.sources.docs).toBe("skipped");
    expect(timedContext.memory).toEqual([]);

    // L159（disabled）/ L160（kind=no_skill）/ L162（无 identity）/ L163（无后端）
    clearPrefetchCache();
    const disabled = await prefetchSkillContext(twenty, identity, cappedMem0, undefined, { disabled: true, noCache: true });
    expect(disabled.skipped).toBe("disabled");
    expect(disabled.memory).toEqual([]);
    expect(disabled.docs).toEqual([]);
    expect(disabled.sources).toEqual({ memory: "skipped", docs: "skipped" });

    const noSkill = await prefetchSkillContext(twenty, identity, cappedMem0, undefined, { kind: "no_skill", noCache: true });
    expect(noSkill.skipped).toBe("no_skill");

    const noIdentity = await prefetchSkillContext(twenty, undefined, cappedMem0, undefined, { noCache: true });
    expect(noIdentity.skipped).toBe("no_identity");

    const noBackends = await prefetchSkillContext(twenty, identity, undefined, undefined, { noCache: true });
    expect(noBackends.skipped).toBe("no_backends");
    // 步骤 4：跳过的路径不留状态——没有写缓存
    expect(prefetchCacheSize()).toBe(0);

    // L169/L171（缓存）：同 identity + 同 query → 不再联系后端；同 identity + 换 query → 重新取
    clearPrefetchCache();
    const cacheSearch = vi.fn(async (_query: string, _userId: string, _options?: { max_results?: number }) => []);
    const cacheMem0 = { search: cacheSearch } as unknown as Mem0Adapter;
    const first = await prefetchSkillContext(twenty, identity, cacheMem0, undefined);
    expect(cacheSearch).toHaveBeenCalledTimes(1);
    expect(prefetchCacheSize()).toBe(1);
    const second = await prefetchSkillContext(twenty, identity, cacheMem0, undefined);
    expect(cacheSearch).toHaveBeenCalledTimes(1);
    expect(second.memoryQuery).toBe(first.memoryQuery);
    const third = await prefetchSkillContext(`${twenty}x`, identity, cacheMem0, undefined);
    expect(cacheSearch).toHaveBeenCalledTimes(2);
    expect(third.memoryQuery).toBe(`${twenty}x`);
    expect(prefetchCacheSize()).toBe(1);

    // L188/L189（allSettled）：一个后端失败，另一个照常服务；prefetch 永不抛
    clearPrefetchCache();
    const failingMem0 = {
      search: vi.fn(async (_query: string, _userId: string, _options?: { max_results?: number }) => {
        throw new Error("mem0 down");
      }),
    } as unknown as Mem0Adapter;
    const workingDocs = vi.fn(async (_query: string, _options?: { scope?: string; max_results?: number }) => [
      { id: "d1", content: "doc", score: 1, metadata: {}, created_at: "2026-01-02T03:04:05Z" },
    ]);
    const partial = await prefetchSkillContext(twenty, identity, failingMem0, { search: workingDocs } as unknown as GraphRAGAdapter, {
      noCache: true,
    });
    expect(partial.sources).toEqual({ memory: "unavailable", docs: "ok" });
    expect(partial.memory).toEqual([]);
    expect(partial.docs).toHaveLength(1);

    // L197/L198：空结果 → empty；未配置的后端 → skipped
    clearPrefetchCache();
    const emptyResult = await prefetchSkillContext(
      twenty,
      identity,
      { search: vi.fn(async (_query: string, _userId: string, _options?: { max_results?: number }) => []) } as unknown as Mem0Adapter,
      undefined,
      { noCache: true },
    );
    expect(emptyResult.sources).toEqual({ memory: "empty", docs: "skipped" });

    // identity 的字符串字段同样原样下发——scope 不做转义也不做过滤
    clearPrefetchCache();
    const injectedScope = { role: "tester", userId: "tester:piko", defaultScope: "../../etc/passwd ' OR 1=1" };
    const scopeDocs = vi.fn(async (_query: string, _options?: { scope?: string; max_results?: number }) => []);
    await prefetchSkillContext(twenty, injectedScope, undefined, { search: scopeDocs } as unknown as GraphRAGAdapter, {
      noCache: true,
    });
    expect(scopeDocs.mock.calls[0][1]).toEqual({
      scope: "../../etc/passwd ' OR 1=1",
      max_results: DEFAULT_PREFETCH_MAX_RESULTS,
    });
    expect(scopeDocs.mock.calls[0][0]).toBe(twenty);
  });
});
