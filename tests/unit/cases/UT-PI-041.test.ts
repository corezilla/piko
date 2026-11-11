/**
 * Case ID: UT-PI-041  ·  STATUS: real
 *
 * 责任：分支 L176 `catch (err)`（catch；graphrag-client.ts）
 * 维度坐标：`search` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-041.md（脚本的唯一依据）
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

describe("UT-PI-041 · search · 错误路径 × 每个 typed 错误码", () => {
  it("turns a fetch rejection into a typed network error and leaves the ok path alone", async () => {  // turns a fetch rejection into a typed network error and leaves the ok path alone
    let mode: "reject" | "ok" = "reject";
    const { calls } = stubFetch(() => {
      if (mode === "reject") return Promise.reject(new Error("ECONNREFUSED"));
      return jsonResponse({
        hits: { hits: [{ _id: "d1", _score: 1, _source: { content: "c" } }] },
      });
    });
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：取真侧——fetch reject
      const err = await adapter.search("q").then(() => null, (e: unknown) => e);
      expect(err).toBeInstanceOf(GraphRAGApiError);
      expect((err as GraphRAGApiError).status).toBe(0);
      expect((err as GraphRAGApiError).code).toBe("network");
      expect((err as GraphRAGApiError).message).toBe(
        "search failed: Error: ECONNREFUSED",
      );
      expect((err as GraphRAGApiError).name).toBe("GraphRAGApiError");
      expect((err as GraphRAGApiError).cause).toBeInstanceOf(Error);
      expect(calls.length).toBe(1);

      // 步骤 3/4：取假侧——fetch 正常返回，不进 catch
      mode = "ok";
      const results = await adapter.search("q");
      expect(results).toEqual([
        { id: "d1", content: "c", score: 1, metadata: {}, created_at: "" },
      ]);
      expect(calls.length).toBe(2);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
