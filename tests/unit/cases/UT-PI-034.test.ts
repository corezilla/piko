/**
 * Case ID: UT-PI-034  ·  STATUS: real
 *
 * 责任：分支 L140 `options?.scope ?? this.defaultScope`（??；graphrag-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-034.md（脚本的唯一依据）
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

describe("UT-PI-034 · search · 状态分支 × 合法迁移", () => {
  it("falls back to defaultScope whenever scope is nullish", async () => {  // falls back to defaultScope whenever scope is nullish
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：scope 非 nullish → 用它；scope nullish → defaultScope
      await adapter.search("q", { scope: "std-templates" });
      await adapter.search("q", { scope: undefined });
      await adapter.search("q", { scope: null as unknown as string });

      // 步骤 3：逐值对账
      expect(calls.map((c) => c.url)).toEqual([
        "https://g.example.com/std-templates/_search",
        "https://g.example.com/docs/_search",
        "https://g.example.com/docs/_search",
      ]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
