/**
 * Case ID: UT-PI-029  ·  STATUS: real
 *
 * 责任：可选参数 `options` 缺省/显式两态（graphrag-client.ts:130）
 * 维度坐标：`search` × `纯函数/无副作用` × `未知枚举`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-029.md（脚本的唯一依据）
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

describe("UT-PI-029 · search · 纯函数/无副作用 × 未知枚举", () => {
  it("makes the omitted options state isomorphic to the explicit default one", async () => {  // makes the omitted options state isomorphic to the explicit default one
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：缺省（不传）/ 显式传默认值 / 未知枚举值
      await adapter.search("q");
      await adapter.search("q", {
        scope: undefined,
        filters: undefined,
        max_results: undefined,
      });
      await adapter.search("q", { scope: "unknown-corpus-xyz" });

      // 步骤 3：缺省态与显式默认值态同构
      expect(calls.length).toBe(3);
      expect(calls[0]!.url).toBe(calls[1]!.url);
      expect(calls[0]!.body).toEqual(calls[1]!.body);
      expect(calls[0]!.url).toBe("https://g.example.com/docs/_search");
      expect(calls[0]!.body).toEqual({
        size: 5,
        query: {
          multi_match: {
            query: "q",
            fields: ["content^2", "title"],
            type: "best_fields",
          },
        },
      });
      // 未知枚举值不被拒绝，原样当作索引名使用（实现没有 scope 白名单）
      expect(calls[2]!.url).toBe("https://g.example.com/unknown-corpus-xyz/_search");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
