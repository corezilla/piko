/**
 * Case ID: UT-PI-020  ·  STATUS: real
 *
 * 责任：参数 `defaultScope: string` 的 `超长` 类（graphrag-client.ts:109）
 * 维度坐标：`GraphRAGAdapter.constructor` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-020.md（脚本的唯一依据）
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

describe("UT-PI-020 · GraphRAGAdapter.constructor · 字符串/路径/枚举输入 × 超长", () => {
  it("accepts an overlong defaultScope and encodes it into the index segment", async () => {  // accepts an overlong defaultScope and encodes it into the index segment
    const longScope = "s".repeat(8192);
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      // 步骤 1/2：长度 2×4096 的 defaultScope —— 构造器不校验长度
      const adapter = new GraphRAGAdapter(
        "https://g.example.com",
        "key",
        longScope,
      );
      expect(adapter).toBeInstanceOf(GraphRAGAdapter);
      await adapter.search("q");

      // 步骤 3：逐值对账
      expect(calls.length).toBe(1);
      expect(calls[0]!.url).toBe(`https://g.example.com/${longScope}/_search`);
      expect(calls[0]!.url.length).toBe(
        "https://g.example.com/".length + 8192 + "/_search".length,
      );

      // 含 "/" 的超长 scope：斜杠被 encodeURIComponent 编成 %2F
      const slashAdapter = new GraphRAGAdapter(
        "https://g.example.com",
        "key",
        "a/".repeat(4096),
      );
      await slashAdapter.search("q");
      expect(calls[1]!.url).toBe(
        `https://g.example.com/${"a%2F".repeat(4096)}/_search`,
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
