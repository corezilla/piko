/**
 * Case ID: UT-PI-026  ·  STATUS: real
 *
 * 责任：参数 `options: GraphRAGSearchOptions` 的 `每等价类合法值` 类（graphrag-client.ts:130）
 * 维度坐标：`search` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-026.md（脚本的唯一依据）
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

describe("UT-PI-026 · search · 纯函数/无副作用 × 每等价类合法值", () => {
  it("maps every legal options equivalence class onto the request", async () => {  // maps every legal options equivalence class onto the request
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：options 的每个等价类一个代表值（scope / filters / max_results）
      await adapter.search("q", {
        scope: "std-templates",
        filters: { kind: "spec", level: 3 },
        max_results: 7,
      });

      // 步骤 3：逐值对账
      expect(calls.length).toBe(1);
      expect(calls[0]!.url).toBe("https://g.example.com/std-templates/_search");
      expect(calls[0]!.method).toBe("POST");
      expect(calls[0]!.headers["authorization"]).toBe("Bearer key");
      expect(calls[0]!.headers["content-type"]).toBe("application/json");
      expect(calls[0]!.body).toEqual({
        size: 7,
        query: {
          multi_match: {
            query: "q",
            fields: ["content^2", "title"],
            type: "best_fields",
          },
          bool: { filter: [{ term: { kind: "spec" } }, { term: { level: 3 } }] },
        },
      });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
