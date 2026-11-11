/**
 * Case ID: UT-PI-017  ·  STATUS: real
 *
 * 责任：参数 `apiKey: string` 的 `超长` 类（graphrag-client.ts:109）
 * 维度坐标：`GraphRAGAdapter.constructor` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-017.md（脚本的唯一依据）
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

describe("UT-PI-017 · GraphRAGAdapter.constructor · 字符串/路径/枚举输入 × 超长", () => {
  it("keeps an overlong apiKey intact in the Authorization header", async () => {  // keeps an overlong apiKey intact in the Authorization header
    const longKey = "k".repeat(8192);
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      // 步骤 1/2：长度 2×4096 的 apiKey —— 构造器不校验长度
      const adapter = new GraphRAGAdapter("https://g.example.com", longKey);
      expect(adapter).toBeInstanceOf(GraphRAGAdapter);
      await adapter.search("q");

      // 步骤 3：逐值对账
      expect(calls.length).toBe(1);
      expect(calls[0]!.headers["authorization"]).toBe(`Bearer ${longKey}`);
      expect(calls[0]!.headers["authorization"]!.length).toBe(
        8192 + "Bearer ".length,
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
