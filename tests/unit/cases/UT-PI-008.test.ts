/**
 * Case ID: UT-PI-008  ·  STATUS: real
 *
 * 责任：`search` × `持久化/序列化` × `截断/损坏`（波次一粗粒度登记；graphrag-client.ts:130）
 * 维度坐标：`search` × `持久化/序列化` × `截断/损坏`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-008.md（脚本的唯一依据）
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

describe("UT-PI-008 · search · 持久化/序列化 × 截断/损坏", () => {
  it("surfaces a corrupt 2xx payload and the three rejection paths without residue", async () => {  // surfaces a corrupt 2xx payload and the three rejection paths without residue
    // 步骤 1：构造「截断/损坏」的响应体——一段被截断的合法 JSON 前缀
    const truncated = '{"hits":{"hits":[{"_id":"d1","_score":1,';
    let mode: "corrupt" | "network" | "http" = "corrupt";
    const { calls } = stubFetch(() => {
      if (mode === "corrupt") return rawResponse(truncated, { status: 200 });
      if (mode === "network") return Promise.reject(new Error("ECONNREFUSED"));
      return jsonResponse(
        { error: { reason: "index missing" } },
        { status: 404, statusText: "Not Found" },
      );
    });
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 2：调用 search —— 损坏的 2xx 响应体
      const err = await adapter.search("q").then(() => null, (e: unknown) => e);
      // 步骤 3：断言——实现的真实行为：2xx 分支里的 response.json() 没有 try 包裹，
      // 解析失败以 SyntaxError 原样上抛（不是 typed 的 GraphRAGApiError）
      expect(err).toBeInstanceOf(SyntaxError);
      expect(err).not.toBeInstanceOf(GraphRAGApiError);
      expect((err as Error).name).toBe("SyntaxError");
      expect(calls.length).toBe(1);

      // 步骤 4：逐一触发 3 处 throw/reject
      // (a) query 为空白串 —— 普通 Error，不是 typed 错误
      const emptyErr = await adapter.search("   ").then(() => null, (e: unknown) => e);
      expect(emptyErr).toBeInstanceOf(Error);
      expect(emptyErr).not.toBeInstanceOf(GraphRAGApiError);
      expect((emptyErr as Error).message).toBe("query required");
      expect(calls.length).toBe(1);

      // (b) fetch reject —— typed：status=0 / code="network"
      mode = "network";
      const netErr = await adapter.search("q").then(() => null, (e: unknown) => e);
      expect(netErr).toBeInstanceOf(GraphRAGApiError);
      expect((netErr as GraphRAGApiError).status).toBe(0);
      expect((netErr as GraphRAGApiError).code).toBe("network");
      expect((netErr as GraphRAGApiError).message).toBe(
        "search failed: Error: ECONNREFUSED",
      );
      expect(calls.length).toBe(2);

      // (c) HTTP 非 2xx —— typed：status=404 / code="not_found"
      mode = "http";
      const httpErr = await adapter.search("q").then(() => null, (e: unknown) => e);
      expect(httpErr).toBeInstanceOf(GraphRAGApiError);
      expect((httpErr as GraphRAGApiError).status).toBe(404);
      expect((httpErr as GraphRAGApiError).code).toBe("not_found");
      expect((httpErr as GraphRAGApiError).message).toBe("index missing");
      expect(calls.length).toBe(3);

      // 步骤 5：断言无残留——三次请求都是 POST 打到同一个 URL，没有状态写
      expect(calls.map((c) => c.method)).toEqual(["POST", "POST", "POST"]);
      expect(calls.map((c) => c.url)).toEqual([
        "https://g.example.com/docs/_search",
        "https://g.example.com/docs/_search",
        "https://g.example.com/docs/_search",
      ]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
