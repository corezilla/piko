/**
 * Case ID: UT-PI-042  ·  STATUS: real
 *
 * 责任：分支 L180 `if (response.ok)`（if；graphrag-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-042.md（脚本的唯一依据）
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

describe("UT-PI-042 · search · 状态分支 × 合法迁移", () => {
  it("maps the response onto results when ok and onto a typed error otherwise", async () => {  // maps the response onto results when ok and onto a typed error otherwise
    let mode: "ok" | "missing" = "ok";
    const { calls } = stubFetch(() => {
      if (mode === "ok") {
        return jsonResponse({
          hits: {
            hits: [
              {
                _id: "d1",
                _score: 3,
                _source: {
                  content: "c",
                  metadata: { k: "v" },
                  created_at: "2026-01-01",
                },
              },
            ],
          },
        });
      }
      return jsonResponse(
        { error: { reason: "no such index" } },
        { status: 404, statusText: "Not Found" },
      );
    });
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：取真侧——response.ok 为真
      const results = await adapter.search("q");
      expect(results).toEqual([
        {
          id: "d1",
          content: "c",
          score: 3,
          metadata: { k: "v" },
          created_at: "2026-01-01",
        },
      ]);
      expect(calls.length).toBe(1);

      // 步骤 3/4：取假侧——response.ok 为假
      mode = "missing";
      const err = await adapter.search("q").then(() => null, (e: unknown) => e);
      expect(err).toBeInstanceOf(GraphRAGApiError);
      expect((err as GraphRAGApiError).status).toBe(404);
      expect((err as GraphRAGApiError).code).toBe("not_found");
      expect((err as GraphRAGApiError).message).toBe("no such index");
      expect(calls.length).toBe(2);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
