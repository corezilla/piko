/**
 * Case ID: UT-PI-022  ·  STATUS: real
 *
 * 责任：可选参数 `defaultScope` 缺省/显式两态（graphrag-client.ts:109）
 * 维度坐标：`GraphRAGAdapter.constructor` × `字符串/路径/枚举输入` × `未知枚举`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-022.md（脚本的唯一依据）
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

describe("UT-PI-022 · GraphRAGAdapter.constructor · 字符串/路径/枚举输入 × 未知枚举", () => {
  it("makes the omitted defaultScope isomorphic to the explicit all and passes unknown scopes through", async () => {  // makes the omitted defaultScope isomorphic to the explicit all and passes unknown scopes through
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      // 步骤 1/2：缺省（不传）/ 显式传默认值 "all" / 未知枚举值
      const omitted = new GraphRAGAdapter("https://g.example.com", "key");
      const explicit = new GraphRAGAdapter(
        "https://g.example.com",
        "key",
        "all",
      );
      const unknown = new GraphRAGAdapter(
        "https://g.example.com",
        "key",
        "unknown-corpus-xyz",
      );
      await omitted.search("q");
      await explicit.search("q");
      await unknown.search("q");

      // 步骤 3：缺省态与显式默认值态同构
      expect(calls.length).toBe(3);
      expect(calls[0]!.url).toBe(calls[1]!.url);
      expect(calls[0]!.url).toBe("https://g.example.com/all/_search");
      // 未知枚举值不被拒绝，原样当索引名用（实现没有 scope 白名单）
      expect(calls[2]!.url).toBe(
        "https://g.example.com/unknown-corpus-xyz/_search",
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
