/**
 * Case ID: UT-PI-033  ·  STATUS: real
 *
 * 责任：分支 L140 `options?.scope ?? this.defaultScope ?? "all"`（??；graphrag-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-033.md（脚本的唯一依据）
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

describe("UT-PI-033 · search · 状态分支 × 合法迁移", () => {
  it("resolves the index through scope, then defaultScope, then all", async () => {  // resolves the index through scope, then defaultScope, then all
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      const scoped = new GraphRAGAdapter("https://g.example.com", "key", "docs");
      const nullScope = new GraphRAGAdapter(
        "https://g.example.com",
        "key",
        null as unknown as string,
      );

      // 步骤 1/2：三个 ?? 臂依次被取到
      await scoped.search("q", { scope: "std-templates" }); // 第一臂：options.scope
      await scoped.search("q"); // 第二臂：this.defaultScope
      await nullScope.search("q"); // 第三臂："all"

      // 步骤 3：逐值对账
      expect(calls.map((c) => c.url)).toEqual([
        "https://g.example.com/std-templates/_search",
        "https://g.example.com/docs/_search",
        "https://g.example.com/all/_search",
      ]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
