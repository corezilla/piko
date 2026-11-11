/**
 * Case ID: UT-PI-028  ·  STATUS: real
 *
 * 责任：参数 `options: GraphRAGSearchOptions` 的 `非法值` 类（graphrag-client.ts:130）
 * 维度坐标：`search` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-028.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import {
  GraphRAGAdapter,
  GraphRAGApiError,
  type GraphRAGSearchOptions,
} from "../../../src/graphrag-client.js";
import {
  jsonResponse,
  rawResponse,
  stubFetch,
} from "./support/b-graphrag-fix.js";

describe("UT-PI-028 · search · 纯函数/无副作用 × 非法值", () => {
  it("accepts illegal option values and forwards them unchanged", async () => {  // accepts illegal option values and forwards them unchanged
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：非法值——越界的 max_results、非字符串的 scope、非对象的 filters
      const bad: GraphRAGSearchOptions[] = [
        { max_results: 0 },
        { max_results: -1 },
        { max_results: 21 },
        { max_results: 100 },
        { max_results: Number.NaN },
        { scope: 123 as unknown as string },
        { scope: null as unknown as string },
        { filters: "ab" as unknown as Record<string, any> },
        { filters: 5 as unknown as Record<string, any> },
        { filters: null as unknown as Record<string, any> },
      ];
      for (const options of bad) {
        await adapter.search("q", options);
      }

      // 步骤 3：逐值对账——实现不做任何校验，非法值原样透传（不抛 typed 错误）
      expect(calls.length).toBe(bad.length);
      const sizes = calls.map((c) => (c.body as { size: number | null }).size);
      expect(sizes).toEqual([0, -1, 21, 100, null, 5, 5, 5, 5, 5]);
      // NaN 被 JSON 序列化成 null
      expect(calls[4]!.rawBody).toContain('"size":null');
      // scope 是数字时按字符串编码进 URL
      expect(calls[5]!.url).toBe("https://g.example.com/123/_search");
      // scope 为 null（nullish）→ 落到构造器的 defaultScope
      expect(calls[6]!.url).toBe("https://g.example.com/docs/_search");
      // filters 是字符串时按字符下标拆成 term 子句
      expect((calls[7]!.body as any).query.bool).toEqual({
        filter: [{ term: { 0: "a" } }, { term: { 1: "b" } }],
      });
      // filters 是数字时没有可枚举属性 → 不带 bool
      expect(
        Object.prototype.hasOwnProperty.call((calls[8]!.body as any).query, "bool"),
      ).toBe(false);
      // filters 为 null（nullish）→ ?? {} → 不带 bool
      expect(
        Object.prototype.hasOwnProperty.call((calls[9]!.body as any).query, "bool"),
      ).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
