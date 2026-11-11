/**
 * Case ID: UT-PI-221  ·  STATUS: real
 *
 * 责任：参数 `query: string` 的 `超长` 类（mem0-client.ts:88）
 * 维度坐标：`search` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-221.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-221 · search · 字符串/路径/枚举输入 × 超长", () => {
  it("keeps an oversized query intact in the request body", async () => {  // keeps an oversized query intact in the request body
    // 步骤 1：源码里 query 无比较常量 → 取默认上限 4096，超长＝2×上限＝8192
    const long = "q".repeat(8192);
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      // 步骤 2/3：search，断言请求体里的 query 原样（无截断、无拒绝）
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      await adapter.search(long, "u");
      const sent = bodyOf(ff.calls[0]!).query;
      expect(sent).toBe(long);
      expect((sent as string).length).toBe(8192);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
