/**
 * Case ID: UT-PI-002  ·  STATUS: real
 *
 * 责任：`execute` × `状态分支` × `合法迁移`（波次一粗粒度登记；graphrag-tools.ts:122）
 * 维度坐标：`execute` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-002.md（脚本的唯一依据）
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

describe("UT-PI-002 · execute · 状态分支 × 合法迁移", () => {
  it("resolves the scope, falls back on typed errors and rethrows the rest", async () => {  // resolves the scope, falls back on typed errors and rethrows the rest
    let mode: "ok" | "notfound" | "network" = "ok";
    const { calls } = stubFetch(() => {
      if (mode === "ok") {
        return jsonResponse({
          hits: {
            hits: [
              {
                _id: "d1",
                _score: 1,
                _source: {
                  content: "c",
                  metadata: { k: "v" },
                  created_at: "2026-01-01",
                },
              },
              { _id: "d2", _score: 2, _source: { content: "d" } },
            ],
          },
        });
      }
      if (mode === "notfound") {
        return jsonResponse(
          { error: { reason: "no such index" } },
          { status: 404, statusText: "Not Found" },
        );
      }
      return Promise.reject(new Error("ECONNREFUSED"));
    });
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");
      const tool = createGraphragSearchTool({
        graphrag: adapter,
        context: { role: "tester", projectName: "piko" },
      });

      // 步骤 2：L123 ?? —— params.scope ?? "all"
      const scoped = await tool.execute(
        "id",
        { query: "q", scope: "std-templates" },
        () => {},
        {} as any,
        {} as any,
        {} as any,
      );
      expect(scoped.details).toEqual({ count: 2, scope: "std-templates" });
      expect((scoped.content[0] as { text: string }).text).toBe(
        JSON.stringify([
          {
            id: "d1",
            content: "c",
            score: 1,
            metadata: { k: "v" },
            created_at: "2026-01-01",
          },
          { id: "d2", content: "d", score: 2, metadata: {}, created_at: "" },
        ]),
      );

      // 缺省 scope 时 details 报 "all"，但请求实际打在构造器的 defaultScope 上
      const unscoped = await tool.execute(
        "id",
        { query: "q" },
        () => {},
        {} as any,
        {} as any,
        {} as any,
      );
      expect(unscoped.details).toEqual({ count: 2, scope: "all" });
      expect(calls[1]!.url).toBe("https://g.example.com/docs/_search");

      // 步骤 3：L133 catch + L134 if —— GraphRAGApiError 走 fallback
      mode = "notfound";
      const fallback = await tool.execute(
        "id",
        { query: "q", scope: "std-templates" },
        () => {},
        {} as any,
        {} as any,
        {} as any,
      );
      expect((fallback.content[0] as { text: string }).text).toBe(
        "doc search unavailable: not_found",
      );
      expect(fallback.details).toEqual({
        error: "not_found",
        status: 404,
        scope: "std-templates",
      });

      // 网络错误同样降级成 fallback，status = 0
      mode = "network";
      const net = await tool.execute(
        "id",
        { query: "q" },
        () => {},
        {} as any,
        {} as any,
        {} as any,
      );
      expect((net.content[0] as { text: string }).text).toBe(
        "doc search unavailable: network",
      );
      expect(net.details).toEqual({ error: "network", status: 0, scope: "all" });

      // 步骤 4：L140 —— 非 GraphRAGApiError 原样上抛
      const err = await tool
        .execute("id", { query: "" }, () => {}, {} as any, {} as any, {} as any)
        .then(() => null, (e: unknown) => e);
      expect(err).toBeInstanceOf(Error);
      expect(err).not.toBeInstanceOf(GraphRAGApiError);
      expect((err as Error).message).toBe("query required");

      // 步骤 5：断言无残留
      expect(calls.length).toBe(4);
      expect(calls.map((c) => c.method)).toEqual(["POST", "POST", "POST", "POST"]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
