/**
 * Case ID: UT-PI-016  ·  STATUS: real
 *
 * 责任：参数 `apiKey: string` 的 `空` 类（graphrag-client.ts:109）
 * 维度坐标：`GraphRAGAdapter.constructor` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-016.md（脚本的唯一依据）
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

describe("UT-PI-016 · GraphRAGAdapter.constructor · 字符串/路径/枚举输入 × 空", () => {
  it("builds the Authorization header from an empty, missing or null apiKey", async () => {  // builds the Authorization header from an empty, missing or null apiKey
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      // 步骤 1/2：apiKey 的 ''（空串）、undefined（缺省）、null（显式空值）三态
      const empty = new GraphRAGAdapter("https://g.example.com", "");
      const missing = new GraphRAGAdapter(
        "https://g.example.com",
        undefined as unknown as string,
      );
      const nulled = new GraphRAGAdapter(
        "https://g.example.com",
        null as unknown as string,
      );
      expect(empty).toBeInstanceOf(GraphRAGAdapter);
      expect(missing).toBeInstanceOf(GraphRAGAdapter);
      expect(nulled).toBeInstanceOf(GraphRAGAdapter);

      // 步骤 3：逐值对账——Authorization 头把 apiKey 原样插进模板
      await empty.search("q");
      await missing.search("q");
      await nulled.search("q");
      expect(calls.map((c) => c.headers["authorization"])).toEqual([
        "Bearer ",
        "Bearer undefined",
        "Bearer null",
      ]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
