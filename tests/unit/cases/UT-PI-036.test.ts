/**
 * Case ID: UT-PI-036  ·  STATUS: real
 *
 * 责任：分支 L147 `options?.max_results ?? 5`（??；graphrag-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-036.md（脚本的唯一依据）
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

describe("UT-PI-036 · search · 状态分支 × 合法迁移", () => {
  it("uses max_results when present and five when absent", async () => {  // uses max_results when present and five when absent
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：取真侧——max_results 有值；取假侧——缺省
      await adapter.search("q", { max_results: 12 });
      await adapter.search("q");

      // 步骤 3：逐值对账
      const sizes = calls.map((c) => (c.body as { size: number }).size);
      expect(sizes).toEqual([12, 5]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
