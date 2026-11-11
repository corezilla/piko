/**
 * Case ID: UT-PI-021  ·  STATUS: real
 *
 * 责任：参数 `defaultScope: string` 的 `注入字符` 类（graphrag-client.ts:109）
 * 维度坐标：`GraphRAGAdapter.constructor` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-021.md（脚本的唯一依据）
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

describe("UT-PI-021 · GraphRAGAdapter.constructor · 字符串/路径/枚举输入 × 注入字符", () => {
  it("percent-encodes an injected defaultScope into the index segment", async () => {  // percent-encodes an injected defaultScope into the index segment
    const payloads = [
      "../../etc/passwd",
      "/etc/passwd",
      "'; DROP TABLE docs;--",
      "a\nb",
      "\u0000",
    ];
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      // 步骤 1/2：defaultScope 的注入串
      for (const payload of payloads) {
        const adapter = new GraphRAGAdapter(
          "https://g.example.com",
          "key",
          payload,
        );
        await adapter.search("q");
      }

      // 步骤 3：逐值对账——defaultScope 段被 encodeURIComponent 逐字符编码
      expect(calls.map((c) => c.url)).toEqual([
        "https://g.example.com/..%2F..%2Fetc%2Fpasswd/_search",
        "https://g.example.com/%2Fetc%2Fpasswd/_search",
        "https://g.example.com/'%3B%20DROP%20TABLE%20docs%3B--/_search",
        "https://g.example.com/a%0Ab/_search",
        "https://g.example.com/%00/_search",
      ]);
      // 编码后不再有裸斜杠，穿越串不能改变 URL 的路径层级
      expect(calls[0]!.url).not.toContain("/../");
      expect(calls[1]!.url).not.toContain("//etc");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
