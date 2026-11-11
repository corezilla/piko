/**
 * Case ID: UT-PI-044  ·  STATUS: real
 *
 * 责任：分支 L194 `data.hits?.hits`（?.；graphrag-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-044.md（脚本的唯一依据）
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

describe("UT-PI-044 · search · 状态分支 × 合法迁移", () => {
  it("short-circuits the optional chain on data.hits only when hits is nullish", async () => {  // short-circuits the optional chain on data.hits only when hits is nullish
    let payload: unknown = {
      hits: { hits: [{ _id: "d1", _score: 1, _source: { content: "c" } }] },
    };
    const { calls } = stubFetch(() => jsonResponse(payload));
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：取真侧——data.hits 有效，可选链不短路
      const hits = await adapter.search("q");
      expect(hits).toHaveLength(1);
      expect(hits[0]!.id).toBe("d1");

      // 步骤 3/4：取假侧——data.hits 缺省 / 为 null → 短路取 undefined
      payload = { hits: null };
      expect(await adapter.search("q")).toEqual([]);
      payload = {};
      expect(await adapter.search("q")).toEqual([]);
      // data.hits 有效但 hits 字段缺省 → ?? [] 兜底
      payload = { hits: {} };
      expect(await adapter.search("q")).toEqual([]);
      expect(calls.length).toBe(4);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
