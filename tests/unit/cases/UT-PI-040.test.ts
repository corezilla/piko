/**
 * Case ID: UT-PI-040  ·  STATUS: real
 *
 * 责任：分支 L157 `if (filterEntries.length > 0)`（if；graphrag-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-040.md（脚本的唯一依据）
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

describe("UT-PI-040 · search · 状态分支 × 合法迁移", () => {
  it("emits one term clause per filter entry and no clause at all for none", async () => {  // emits one term clause per filter entry and no clause at all for none
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：filterEntries.length = 1 / 2（取真侧）与 0（取假侧）
      await adapter.search("q", { filters: { a: 1 } });
      await adapter.search("q", { filters: { a: 1, b: 2 } });
      await adapter.search("q", { filters: {} });
      await adapter.search("q");

      // 步骤 3：逐值对账
      const bodies = calls.map((c) => c.body as any);
      expect(bodies[0]!.query.bool).toEqual({
        filter: [{ term: { a: 1 } }],
      });
      expect(bodies[1]!.query.bool).toEqual({
        filter: [{ term: { a: 1 } }, { term: { b: 2 } }],
      });
      expect(
        Object.prototype.hasOwnProperty.call(bodies[2]!.query, "bool"),
      ).toBe(false);
      expect(
        Object.prototype.hasOwnProperty.call(bodies[3]!.query, "bool"),
      ).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
