/**
 * Case ID: UT-PI-009  ·  STATUS: real
 *
 * 责任：`search` × `字符串/路径/枚举输入` × `路径穿越`（波次一粗粒度登记；graphrag-client.ts:130）
 * 维度坐标：`search` × `字符串/路径/枚举输入` × `路径穿越`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-009.md（脚本的唯一依据）
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

describe("UT-PI-009 · search · 字符串/路径/枚举输入 × 路径穿越", () => {
  it("percent-encodes traversal strings so they cannot climb out of the index path", async () => {  // percent-encodes traversal strings so they cannot climb out of the index path
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：相对穿越串作为 scope —— 索引段被 encodeURIComponent 编码
      await adapter.search("q", { scope: "../../etc/passwd" });
      expect(calls[0]!.url).toBe(
        "https://g.example.com/..%2F..%2Fetc%2Fpasswd/_search",
      );
      expect(calls[0]!.url).not.toContain("/../");

      // 绝对路径穿越串作为 scope
      await adapter.search("q", { scope: "/etc/shadow" });
      expect(calls[1]!.url).toBe("https://g.example.com/%2Fetc%2Fshadow/_search");
      expect(calls[1]!.url).not.toContain("//etc");

      // 构造器 defaultScope 里的穿越串走同一条编码路径
      const scoped = new GraphRAGAdapter(
        "https://g.example.com",
        "key",
        "../../etc/passwd",
      );
      await scoped.search("q");
      expect(calls[2]!.url).toBe(
        "https://g.example.com/..%2F..%2Fetc%2Fpasswd/_search",
      );

      // query 里的穿越串只进请求体，不进 URL
      await adapter.search("../../etc/passwd");
      expect(calls[3]!.url).toBe("https://g.example.com/docs/_search");
      expect(calls[3]!.url).not.toContain("passwd");
      expect(
        (
          calls[3]!.body as {
            query: { multi_match: { query: string } };
          }
        ).query.multi_match.query,
      ).toBe("../../etc/passwd");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
