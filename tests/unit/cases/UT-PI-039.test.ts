/**
 * Case ID: UT-PI-039  ·  STATUS: real
 *
 * 责任：分支 L156 `options?.filters`（?.；graphrag-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-039.md（脚本的唯一依据）
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

describe("UT-PI-039 · search · 状态分支 × 合法迁移", () => {
  it("short-circuits the optional chain on filters only when options is nullish", async () => {  // short-circuits the optional chain on filters only when options is nullish
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：options 有效 → 不短路 → 读 options.filters
      await adapter.search("q", { filters: { b: 2 } });
      // 步骤 3/4：options 缺省 / null → 短路取 undefined → ?? {}
      await adapter.search("q");
      await adapter.search("q", null as unknown as GraphRAGSearchOptions);

      const bodies = calls.map((c) => c.body as any);
      expect(bodies[0]!.query.bool).toEqual({
        filter: [{ term: { b: 2 } }],
      });
      expect(
        Object.prototype.hasOwnProperty.call(bodies[1]!.query, "bool"),
      ).toBe(false);
      expect(
        Object.prototype.hasOwnProperty.call(bodies[2]!.query, "bool"),
      ).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
