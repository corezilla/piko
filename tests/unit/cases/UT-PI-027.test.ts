/**
 * Case ID: UT-PI-027  ·  STATUS: real
 *
 * 责任：参数 `options: GraphRAGSearchOptions` 的 `边界(上/下/零/空/满)` 类（graphrag-client.ts:130）
 * 维度坐标：`search` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-027.md（脚本的唯一依据）
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

describe("UT-PI-027 · search · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("passes boundary option values through without clamping them", async () => {  // passes boundary option values through without clamping them
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：边界取值——下界 1 / 上界 20 / 零 0 / 缺省 / 空串 scope / 空 filters
      const bounds: Array<{
        options: GraphRAGSearchOptions;
        size: number;
        url: string;
        hasBool: boolean;
      }> = [
        {
          options: { max_results: 1 },
          size: 1,
          url: "https://g.example.com/docs/_search",
          hasBool: false,
        },
        {
          options: { max_results: 20 },
          size: 20,
          url: "https://g.example.com/docs/_search",
          hasBool: false,
        },
        {
          options: { max_results: 0 },
          size: 0,
          url: "https://g.example.com/docs/_search",
          hasBool: false,
        },
        {
          options: {},
          size: 5,
          url: "https://g.example.com/docs/_search",
          hasBool: false,
        },
        {
          options: { scope: "" },
          size: 5,
          url: "https://g.example.com//_search",
          hasBool: false,
        },
        {
          options: { filters: {} },
          size: 5,
          url: "https://g.example.com/docs/_search",
          hasBool: false,
        },
      ];
      for (const b of bounds) {
        await adapter.search("q", b.options);
      }

      // 步骤 3：逐值对账
      expect(calls.length).toBe(bounds.length);
      bounds.forEach((b, i) => {
        const body = calls[i]!.body as { size: number; query: Record<string, unknown> };
        expect(body.size).toBe(b.size);
        expect(calls[i]!.url).toBe(b.url);
        expect(Object.prototype.hasOwnProperty.call(body.query, "bool")).toBe(b.hasBool);
      });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
