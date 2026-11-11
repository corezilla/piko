/**
 * Case ID: UT-PI-219  ·  STATUS: real
 *
 * 责任：参数 `apiKey: string` 的 `注入字符` 类（mem0-client.ts:73）
 * 维度坐标：`Mem0Adapter.constructor` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-219.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { headersOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-219 · Mem0Adapter.constructor · 字符串/路径/枚举输入 × 注入字符", () => {
  it("passes injected apiKey characters into the header without sanitising them", async () => {  // passes injected apiKey characters into the header without sanitising them
    // 步骤 1：穿越串 / 控制字符 / SQL 元字符 / 超长＋注入组合串
    const payloads = [
      "../../etc/passwd",
      "key\r\nX-Injected: 1",
      "key'; DROP TABLE memories;--",
      "k".repeat(4096) + "\r\nX-Evil: 1",
    ];
    const ff = scriptedFetch(payloads.map(() => ({ status: 200, body: "{}" })));
    vi.stubGlobal("fetch", ff.fetch);
    try {
      // 步骤 2/3：逐个构造并 search，断言注入字符原样进 Authorization 头
      for (const [i, apiKey] of payloads.entries()) {
        const adapter = new Mem0Adapter("https://mem0.test", apiKey);
        await adapter.search("q", "u");
        expect(headersOf(ff.calls[i]!).Authorization).toBe(`Token ${apiKey}`);
        expect(ff.calls[i]!.url).toBe("https://mem0.test/v3/memories/search/");
      }
      expect(ff.calls.length).toBe(payloads.length);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
