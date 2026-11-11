/**
 * Case ID: UT-PI-019  ·  STATUS: real
 *
 * 责任：参数 `defaultScope: string` 的 `空` 类（graphrag-client.ts:109）
 * 维度坐标：`GraphRAGAdapter.constructor` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-019.md（脚本的唯一依据）
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

describe("UT-PI-019 · GraphRAGAdapter.constructor · 字符串/路径/枚举输入 × 空", () => {
  it("resolves an empty, missing or null defaultScope to the index path", async () => {  // resolves an empty, missing or null defaultScope to the index path
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      // 步骤 1/2：defaultScope 的 ''（空串）、undefined（缺省）、null（显式空值）三态
      const empty = new GraphRAGAdapter("https://g.example.com", "key", "");
      const missing = new GraphRAGAdapter(
        "https://g.example.com",
        "key",
        undefined as unknown as string,
      );
      const nulled = new GraphRAGAdapter(
        "https://g.example.com",
        "key",
        null as unknown as string,
      );
      expect(empty).toBeInstanceOf(GraphRAGAdapter);
      await empty.search("q");
      await missing.search("q");
      await nulled.search("q");

      // 步骤 3：逐值对账
      expect(calls.map((c) => c.url)).toEqual([
        "https://g.example.com//_search", // 空串不是 nullish → 索引段为空
        "https://g.example.com/all/_search", // 缺省 → 构造器默认值 "all"
        "https://g.example.com/all/_search", // null 是 nullish → ?? "all"
      ]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
