/**
 * Case ID: UT-PI-025  ·  STATUS: real
 *
 * 责任：参数 `query: string` 的 `注入字符` 类（graphrag-client.ts:130）
 * 维度坐标：`search` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-025.md（脚本的唯一依据）
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

describe("UT-PI-025 · search · 字符串/路径/枚举输入 × 注入字符", () => {
  it("carries injection strings into the JSON body without letting them touch the URL", async () => {  // carries injection strings into the JSON body without letting them touch the URL
    const payloads = [
      "../../etc/passwd",
      "/absolute/path",
      "'; DROP TABLE docs;--",
      "$(rm -rf /)",
      "line1\nline2\r\nline3",
      "\u0000\u0001control",
      "q".repeat(4096) + "'; DROP TABLE docs;--",
    ];
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 2：逐个注入串调用 search
      for (const payload of payloads) {
        const results = await adapter.search(payload);
        expect(results).toEqual([]);
      }

      // 步骤 3：逐值对账——注入串原样进 JSON 请求体，不进 URL，也未被改写
      expect(calls.length).toBe(payloads.length);
      payloads.forEach((payload, i) => {
        const body = calls[i]!.body as {
          query: { multi_match: { query: string } };
        };
        expect(body.query.multi_match.query).toBe(payload);
        expect(calls[i]!.url).toBe("https://g.example.com/docs/_search");
        expect(calls[i]!.url).not.toContain("DROP");
        expect(calls[i]!.url).not.toContain("passwd");
      });
      // 控制字符在原始 JSON 里被转义，解析后还原为原值
      expect(calls[4]!.rawBody).toContain("\\n");
      expect(calls[5]!.rawBody).toContain("\\u0000");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
