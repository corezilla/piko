/**
 * Case ID: UT-PI-222  ·  STATUS: real
 *
 * 责任：参数 `query: string` 的 `注入字符` 类（mem0-client.ts:88）
 * 维度坐标：`search` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-222.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-222 · search · 字符串/路径/枚举输入 × 注入字符", () => {
  it("passes injected query characters through as data in the request body", async () => {  // passes injected query characters through as data in the request body
    // 步骤 1：穿越串 / 控制字符 / SQL 元字符 / 超长＋注入组合串
    const payloads = [
      "../../etc/passwd",
      "q\u0000\u0007cmd",
      "'; DROP TABLE memories;--",
      "q".repeat(4096) + "'; DROP TABLE memories;--",
    ];
    const ff = scriptedFetch(payloads.map(() => ({ status: 200, body: "{}" })));
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 2/3：逐个 search，断言注入字符原样进 body（控制字符只被 JSON 转义）
      for (const [i, query] of payloads.entries()) {
        await adapter.search(query, "u");
        expect(bodyOf(ff.calls[i]!).query).toBe(query);
      }
      // 控制字符在原始报文里是 JSON 转义序列，不是裸控制字节
      expect(String(ff.calls[1]!.init?.body)).toContain("\\u0000");
      expect(String(ff.calls[1]!.init?.body)).not.toContain("\u0000");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
