/**
 * Case ID: UT-PI-014  ·  STATUS: real
 *
 * 责任：参数 `baseUrl: string` 的 `超长` 类（graphrag-client.ts:109）
 * 维度坐标：`GraphRAGAdapter.constructor` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-014.md（脚本的唯一依据）
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

describe("UT-PI-014 · GraphRAGAdapter.constructor · 字符串/路径/枚举输入 × 超长", () => {
  it("accepts an overlong baseUrl and keeps it verbatim in the request URL", async () => {  // accepts an overlong baseUrl and keeps it verbatim in the request URL
    const longBase = "h".repeat(8192);
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      // 步骤 1/2：长度 2×4096 的 baseUrl —— 构造器不校验长度
      const adapter = new GraphRAGAdapter(longBase, "key");
      expect(adapter).toBeInstanceOf(GraphRAGAdapter);
      await adapter.search("q");

      // 步骤 3：逐值对账——baseUrl 原样进 URL（只有索引段被编码）
      expect(calls.length).toBe(1);
      expect(calls[0]!.url).toBe(`${longBase}/all/_search`);
      expect(calls[0]!.url.length).toBe(8192 + "/all/_search".length);

      // 末尾的斜杠在拼接前被去掉
      const trailing = new GraphRAGAdapter(`${longBase.slice(0, 8191)}/`, "key");
      await trailing.search("q");
      expect(calls[1]!.url).toBe(`${longBase.slice(0, 8191)}/all/_search`);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
