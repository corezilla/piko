/**
 * Case ID: UT-PI-032  ·  STATUS: real
 *
 * 责任：分支 L134 `!query`（!；graphrag-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-032.md（脚本的唯一依据）
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

describe("UT-PI-032 · search · 状态分支 × 合法迁移", () => {
  it("rejects a falsy query and searches normally for a truthy one", async () => {  // rejects a falsy query and searches normally for a truthy one
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：取真侧——query 是假值（'' / undefined / null）
      for (const q of ["", undefined, null]) {
        const err = await adapter
          .search(q as unknown as string)
          .then(() => null, (e: unknown) => e);
        expect(err).toBeInstanceOf(Error);
        expect(err).not.toBeInstanceOf(TypeError);
        expect((err as Error).message).toBe("query required");
      }
      expect(calls.length).toBe(0);

      // 步骤 3/4：取假侧——query 为真值，块内副作用不发生
      const results = await adapter.search("q");
      expect(results).toEqual([]);
      expect(calls.length).toBe(1);
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
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
