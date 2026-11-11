/**
 * Case ID: UT-PI-225  ·  STATUS: real
 *
 * 责任：参数 `user_id: string` 的 `注入字符` 类（mem0-client.ts:88）
 * 维度坐标：`search` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-225.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-225 · search · 字符串/路径/枚举输入 × 注入字符", () => {
  it("passes injected user_id characters through as filter data", async () => {  // passes injected user_id characters through as filter data
    // 步骤 1：穿越串 / 控制字符 / SQL 元字符 / 超长＋注入组合串
    const payloads = [
      "../../etc/passwd",
      "u\u0000\u0007cmd",
      "u'; DROP TABLE memories;--",
      "u".repeat(4096) + "'; DROP TABLE memories;--",
    ];
    const ff = scriptedFetch(payloads.map(() => ({ status: 200, body: "{}" })));
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 2/3：逐个 search，断言注入字符原样进 filters.user_id（未被拒绝）
      for (const [i, user_id] of payloads.entries()) {
        await adapter.search("q", user_id);
        const filters = bodyOf(ff.calls[i]!).filters as Record<string, unknown>;
        expect(filters.user_id).toBe(user_id);
      }
      expect(ff.calls.length).toBe(payloads.length);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
