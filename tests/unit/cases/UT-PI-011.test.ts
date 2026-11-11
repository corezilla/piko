/**
 * Case ID: UT-PI-011  ·  STATUS: real
 *
 * 责任：`execute` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（波次一粗粒度登记；graphrag-tools.ts:122）
 * 维度坐标：`execute` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-011.md（脚本的唯一依据）
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
import { createGraphragSearchTool } from "../../../src/graphrag-tools.js";

describe("UT-PI-011 · execute · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("forwards every boundary parameter value to the adapter unchanged", async () => {  // forwards every boundary parameter value to the adapter unchanged
    const { calls } = stubFetch(() =>
      jsonResponse({
        hits: { hits: [{ _id: "d1", _score: 1, _source: { content: "c" } }] },
      }),
    );
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");
      const tool = createGraphragSearchTool({
        graphrag: adapter,
        context: { role: "tester", projectName: "piko" },
      });

      // 步骤 1/2：边界取值——max_results 下界 1 / 上界 20 / 零 0，
      // scope 空串与 128 字符，query 500 字符
      const q500 = "q".repeat(500);
      const scope128 = "s".repeat(128);
      const r1 = await tool.execute(
        "id",
        { query: "q", max_results: 1 },
        () => {},
        {} as any,
        {} as any,
        {} as any,
      );
      const r20 = await tool.execute(
        "id",
        { query: "q", max_results: 20 },
        () => {},
        {} as any,
        {} as any,
        {} as any,
      );
      const r0 = await tool.execute(
        "id",
        { query: "q", max_results: 0 },
        () => {},
        {} as any,
        {} as any,
        {} as any,
      );
      const rEmptyScope = await tool.execute(
        "id",
        { query: "q", scope: "" },
        () => {},
        {} as any,
        {} as any,
        {} as any,
      );
      const rLongScope = await tool.execute(
        "id",
        { query: "q", scope: scope128 },
        () => {},
        {} as any,
        {} as any,
        {} as any,
      );
      const rLongQuery = await tool.execute(
        "id",
        { query: q500 },
        () => {},
        {} as any,
        {} as any,
        {} as any,
      );

      // 步骤 3：逐值对账——边界值原样透传给适配器与请求体
      expect(r1.details).toEqual({ count: 1, scope: "all" });
      expect(r20.details).toEqual({ count: 1, scope: "all" });
      expect(r0.details).toEqual({ count: 1, scope: "all" });
      expect(rEmptyScope.details).toEqual({ count: 1, scope: "" });
      expect(rLongScope.details).toEqual({ count: 1, scope: scope128 });
      expect(rLongQuery.details).toEqual({ count: 1, scope: "all" });
      expect(calls.map((c) => (c.body as { size: number }).size)).toEqual([
        1, 20, 0, 5, 5, 5,
      ]);
      expect(calls[3]!.url).toBe("https://g.example.com//_search");
      expect(calls[4]!.url).toBe(`https://g.example.com/${scope128}/_search`);
      expect(
        (calls[5]!.body as any).query.multi_match.query.length,
      ).toBe(500);

      // 空 query：适配器抛普通 Error，execute 原样上抛（不降级成 fallback）
      const err = await tool
        .execute("id", { query: "" }, () => {}, {} as any, {} as any, {} as any)
        .then(() => null, (e: unknown) => e);
      expect(err).toBeInstanceOf(Error);
      expect(err).not.toBeInstanceOf(GraphRAGApiError);
      expect((err as Error).message).toBe("query required");
      expect(calls.length).toBe(6);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
