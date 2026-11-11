/**
 * Case ID: UT-PI-030  ·  STATUS: real
 *
 * 责任：分支 L134 `if (!query || query.trim() === "")`（if；graphrag-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-030.md（脚本的唯一依据）
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

describe("UT-PI-030 · search · 状态分支 × 合法迁移", () => {
  it("takes the empty-query branch on the true side and skips it on the false side", async () => {  // takes the empty-query branch on the true side and skips it on the false side
    const { calls } = stubFetch(() =>
      jsonResponse({
        hits: { hits: [{ _id: "d1", _score: 2, _source: { content: "c" } }] },
      }),
    );
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：取真侧——query 为空串，块内的 throw 发生
      const err = await adapter.search("").then(() => null, (e: unknown) => e);
      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toBe("query required");
      expect(calls.length).toBe(0);

      // 步骤 3/4：取假侧——query 非空，块内副作用不发生，请求照常发出
      const results = await adapter.search("q");
      expect(results).toEqual([
        { id: "d1", content: "c", score: 2, metadata: {}, created_at: "" },
      ]);
      expect(calls.length).toBe(1);
      expect(calls[0]!.url).toBe("https://g.example.com/docs/_search");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
