/**
 * Case ID: UT-PI-024  ·  STATUS: real
 *
 * 责任：参数 `query: string` 的 `超长` 类（graphrag-client.ts:130）
 * 维度坐标：`search` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-024.md（脚本的唯一依据）
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

describe("UT-PI-024 · search · 字符串/路径/枚举输入 × 超长", () => {
  it("sends an overlong query verbatim instead of truncating or rejecting it", async () => {  // sends an overlong query verbatim instead of truncating or rejecting it
    const long = "q".repeat(8192);
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 2：调用 search——实现不做长度校验，不抛错
      const results = await adapter.search(long);
      expect(results).toEqual([]);

      // 步骤 3：逐值对账——query 原样进请求体，没有被截断
      expect(calls.length).toBe(1);
      const body = calls[0]!.body as {
        query: { multi_match: { query: string } };
      };
      expect(body.query.multi_match.query).toBe(long);
      expect(body.query.multi_match.query.length).toBe(8192);
      expect(calls[0]!.rawBody).toContain(long);
      expect(calls[0]!.url).toBe("https://g.example.com/docs/_search");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
