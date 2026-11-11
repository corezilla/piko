/**
 * Case ID: UT-PI-038  ·  STATUS: real
 *
 * 责任：分支 L156 `options?.filters ?? {}`（??；graphrag-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-038.md（脚本的唯一依据）
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

describe("UT-PI-038 · search · 状态分支 × 合法迁移", () => {
  it("adds the filter clause only when filters carries entries", async () => {  // adds the filter clause only when filters carries entries
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：取真侧——filters 有值；取假侧——filters 缺省 → {}
      await adapter.search("q", { filters: { kind: "spec" } });
      await adapter.search("q");

      // 步骤 3：逐值对账
      const bodies = calls.map((c) => c.body as any);
      expect(bodies[0]!.query.bool).toEqual({
        filter: [{ term: { kind: "spec" } }],
      });
      expect(
        Object.prototype.hasOwnProperty.call(bodies[1]!.query, "bool"),
      ).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
