/**
 * Case ID: UT-PI-035  ·  STATUS: real
 *
 * 责任：分支 L140 `options?.scope`（?.；graphrag-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-035.md（脚本的唯一依据）
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

describe("UT-PI-035 · search · 状态分支 × 合法迁移", () => {
  it("short-circuits the optional chain only when options is nullish", async () => {  // short-circuits the optional chain only when options is nullish
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：options 有效 → 可选链不短路，读 options.scope
      await adapter.search("q", { scope: "explicit-index" });
      // 步骤 3/4：options 缺省 / null → 可选链短路取 undefined → 落到 defaultScope
      await adapter.search("q");
      await adapter.search("q", null as unknown as GraphRAGSearchOptions);

      expect(calls.map((c) => c.url)).toEqual([
        "https://g.example.com/explicit-index/_search",
        "https://g.example.com/docs/_search",
        "https://g.example.com/docs/_search",
      ]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
