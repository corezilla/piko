/**
 * Case ID: UT-PI-015  ·  STATUS: real
 *
 * 责任：参数 `baseUrl: string` 的 `注入字符` 类（graphrag-client.ts:109）
 * 维度坐标：`GraphRAGAdapter.constructor` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-015.md（脚本的唯一依据）
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

describe("UT-PI-015 · GraphRAGAdapter.constructor · 字符串/路径/枚举输入 × 注入字符", () => {
  it("keeps an injected baseUrl verbatim in the request URL", async () => {  // keeps an injected baseUrl verbatim in the request URL
    const payloads = [
      "../../etc/passwd",
      "/absolute/path",
      "'; DROP TABLE docs;--",
      "$(id)",
      "http://evil.example.com/../admin",
      "base\nhost",
    ];
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      // 步骤 1/2：baseUrl 的注入串 —— 构造器不校验，原样收下
      for (const payload of payloads) {
        const adapter = new GraphRAGAdapter(payload, "key");
        expect(adapter).toBeInstanceOf(GraphRAGAdapter);
        await adapter.search("q");
      }

      // 步骤 3：逐值对账——baseUrl 不做编码/清洗，原样进 URL
      // （只有索引段被 encodeURIComponent；这是实现的真实行为）
      expect(calls.length).toBe(payloads.length);
      payloads.forEach((payload, i) => {
        expect(calls[i]!.url).toBe(`${payload}/all/_search`);
      });
      expect(calls[0]!.url).toContain("/../");
      expect(calls[4]!.url).toContain("http://evil.example.com/../admin");
      expect(calls[5]!.url).toContain("\n");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
