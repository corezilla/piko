/**
 * Case ID: UT-PI-215  ·  STATUS: real
 *
 * 责任：参数 `baseUrl: string` 的 `超长` 类（mem0-client.ts:73）
 * 维度坐标：`Mem0Adapter.constructor` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-215.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-215 · Mem0Adapter.constructor · 字符串/路径/枚举输入 × 超长", () => {
  it("keeps an oversized baseUrl intact instead of truncating it", async () => {  // keeps an oversized baseUrl intact instead of truncating it
    // 步骤 1：源码里 baseUrl 无比较常量 → 取默认上限 4096，超长＝2×上限＝8192
    const long = "h".repeat(8192);
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      // 步骤 2/3：构造后 search，断言 URL 原样带出（无截断、无归一化）
      const adapter = new Mem0Adapter(long, "key");
      await adapter.search("q", "u");
      expect(ff.calls[0]!.url).toBe(`${long}/v3/memories/search/`);
      expect(ff.calls[0]!.url.length).toBe(8192 + "/v3/memories/search/".length);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
