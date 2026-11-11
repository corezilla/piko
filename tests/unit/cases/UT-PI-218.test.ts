/**
 * Case ID: UT-PI-218  ·  STATUS: real
 *
 * 责任：参数 `apiKey: string` 的 `超长` 类（mem0-client.ts:73）
 * 维度坐标：`Mem0Adapter.constructor` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-218.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { headersOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-218 · Mem0Adapter.constructor · 字符串/路径/枚举输入 × 超长", () => {
  it("keeps an oversized apiKey intact in the Authorization header", async () => {  // keeps an oversized apiKey intact in the Authorization header
    // 步骤 1：源码里 apiKey 无比较常量 → 取默认上限 4096，超长＝2×上限＝8192
    const long = "k".repeat(8192);
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      // 步骤 2/3：构造后 search，断言头里的凭证原样带出（无截断）
      const adapter = new Mem0Adapter("https://mem0.test", long);
      await adapter.search("q", "u");
      const auth = headersOf(ff.calls[0]!).Authorization;
      expect(auth).toBe(`Token ${long}`);
      expect(auth.length).toBe("Token ".length + 8192);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
