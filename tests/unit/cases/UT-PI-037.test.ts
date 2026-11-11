/**
 * Case ID: UT-PI-037  ·  STATUS: real
 *
 * 责任：分支 L147 `options?.max_results`（?.；graphrag-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-037.md（脚本的唯一依据）
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

describe("UT-PI-037 · search · 状态分支 × 合法迁移", () => {
  it("short-circuits the optional chain on max_results only when options is nullish", async () => {  // short-circuits the optional chain on max_results only when options is nullish
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：options 有效（不短路）→ 读 options.max_results
      await adapter.search("q", { max_results: 9 });
      await adapter.search("q", { max_results: undefined });
      // 步骤 3/4：options 缺省 / null → 短路取 undefined → ?? 5
      await adapter.search("q");
      await adapter.search("q", null as unknown as GraphRAGSearchOptions);

      const sizes = calls.map((c) => (c.body as { size: number }).size);
      expect(sizes).toEqual([9, 5, 5, 5]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
