/**
 * Case ID: UT-PI-031  ·  STATUS: real
 *
 * 责任：分支 L134 `!query || query.trim() === ""`（||；graphrag-client.ts）
 * 维度坐标：`search` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-031.md（脚本的唯一依据）
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

describe("UT-PI-031 · search · 状态分支 × 合法迁移", () => {
  it("reaches the empty-query throw through either side of the or", async () => {  // reaches the empty-query throw through either side of the or
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      const adapter = new GraphRAGAdapter("https://g.example.com", "key", "docs");

      // 步骤 1/2：取真侧（左操作数为真）——query 是假值
      const left = await adapter.search("").then(() => null, (e: unknown) => e);
      expect((left as Error).message).toBe("query required");
      // 左操作数为真时 query.trim() 根本不被求值 → null 不抛 TypeError
      const nullQuery = await adapter
        .search(null as unknown as string)
        .then(() => null, (e: unknown) => e);
      expect(nullQuery).toBeInstanceOf(Error);
      expect(nullQuery).not.toBeInstanceOf(TypeError);
      expect((nullQuery as Error).message).toBe("query required");

      // 步骤 1/2：取真侧（右操作数为真）——query 非空但 trim 后为空
      const right = await adapter
        .search("   \t\n ")
        .then(() => null, (e: unknown) => e);
      expect((right as Error).message).toBe("query required");
      expect(calls.length).toBe(0);

      // 步骤 3/4：取假侧——两个操作数都为假，正常发请求
      const results = await adapter.search("q");
      expect(results).toEqual([]);
      expect(calls.length).toBe(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
