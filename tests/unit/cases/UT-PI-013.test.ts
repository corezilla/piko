/**
 * Case ID: UT-PI-013  ·  STATUS: real
 *
 * 责任：参数 `baseUrl: string` 的 `空` 类（graphrag-client.ts:109）
 * 维度坐标：`GraphRAGAdapter.constructor` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-013.md（脚本的唯一依据）
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

describe("UT-PI-013 · GraphRAGAdapter.constructor · 字符串/路径/枚举输入 × 空", () => {
  it("constructs with an empty baseUrl and only fails later inside search", async () => {  // constructs with an empty baseUrl and only fails later inside search
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      // 步骤 1/2：baseUrl 的 ''（空串）、undefined（缺省）、null（显式空值）三态——
      // 实现的真实行为：构造器没有任何校验，三态都能构造成功
      const empty = new GraphRAGAdapter("", "key");
      const missing = new GraphRAGAdapter(undefined as unknown as string, "key");
      const nulled = new GraphRAGAdapter(null as unknown as string, "key");
      expect(empty).toBeInstanceOf(GraphRAGAdapter);
      expect(missing).toBeInstanceOf(GraphRAGAdapter);
      expect(nulled).toBeInstanceOf(GraphRAGAdapter);

      // 步骤 3：逐值对账——空串 baseUrl 拼出的是根相对路径
      await empty.search("q");
      expect(calls[0]!.url).toBe("/all/_search");

      // undefined / null 的 baseUrl 在 search 里解引用时报 TypeError（不是 typed 错误）
      const undefErr = await missing
        .search("q")
        .then(() => null, (e: unknown) => e);
      expect(undefErr).toBeInstanceOf(TypeError);
      expect((undefErr as Error).message).toContain("replace");
      const nullErr = await nulled
        .search("q")
        .then(() => null, (e: unknown) => e);
      expect(nullErr).toBeInstanceOf(TypeError);
      expect((nullErr as Error).message).toContain("replace");
      expect(calls.length).toBe(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
