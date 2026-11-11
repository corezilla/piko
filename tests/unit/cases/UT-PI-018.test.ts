/**
 * Case ID: UT-PI-018  ·  STATUS: real
 *
 * 责任：参数 `apiKey: string` 的 `注入字符` 类（graphrag-client.ts:109）
 * 维度坐标：`GraphRAGAdapter.constructor` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-018.md（脚本的唯一依据）
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

describe("UT-PI-018 · GraphRAGAdapter.constructor · 字符串/路径/枚举输入 × 注入字符", () => {
  it("copies an injected apiKey into the Authorization header without sanitising it", async () => {  // copies an injected apiKey into the Authorization header without sanitising it
    const payloads = [
      "key\r\nX-Injected: 1",
      "'; DROP TABLE users;--",
      "$(whoami)",
      "key\u0000null",
      "key\nline2",
    ];
    const { calls } = stubFetch(() => jsonResponse({ hits: { hits: [] } }));
    try {
      // 步骤 1/2：apiKey 的注入串 —— 构造器不校验，原样收下
      for (const payload of payloads) {
        const adapter = new GraphRAGAdapter("https://g.example.com", payload);
        expect(adapter).toBeInstanceOf(GraphRAGAdapter);
        await adapter.search("q");
      }

      // 步骤 3：逐值对账——apiKey 原样进 Authorization 头，
      // 不做换行/控制字符清洗（真实 fetch 会在发送前自行拒绝非法头值）
      expect(calls.map((c) => c.headers["authorization"])).toEqual(
        payloads.map((p) => `Bearer ${p}`),
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
