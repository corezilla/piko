/**
 * Case ID: UT-PI-023  ·  STATUS: real
 *
 * 责任：参数 `query: string` 的 `空` 类（graphrag-client.ts:130）
 * 维度坐标：`search` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-023.md（脚本的唯一依据）
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

describe("UT-PI-023 · search · 字符串/路径/枚举输入 × 空", () => {
  it("rejects the empty, missing and null query before any request is sent", async () => {  // rejects the empty, missing and null query before any request is sent
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：''（空串）、undefined（缺省）、null（显式空值）三态
      for (const q of ["", undefined, null]) {
        const err = await adapter
          .search(q as unknown as string)
          .then(() => null, (e: unknown) => e);
        // 步骤 3：断言——实现的真实行为：抛普通 Error("query required")，
        // 不是 typed 的 GraphRAGApiError（没有 status / code）
        expect(err).toBeInstanceOf(Error);
        expect(err).not.toBeInstanceOf(GraphRAGApiError);
        expect((err as Error).message).toBe("query required");
        expect((err as GraphRAGApiError).status).toBeUndefined();
        expect((err as GraphRAGApiError).code).toBeUndefined();
      }

      // 无状态写/资源残留：一次请求都没发出去
      expect(calls.length).toBe(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
