/**
 * Case ID: UT-PI-224  ·  STATUS: real
 *
 * 责任：参数 `user_id: string` 的 `超长` 类（mem0-client.ts:88）
 * 维度坐标：`search` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-224.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-224 · search · 字符串/路径/枚举输入 × 超长", () => {
  it("keeps an oversized user_id intact in the filters", async () => {  // keeps an oversized user_id intact in the filters
    // 步骤 1：源码里 user_id 无长度比较常量 → 默认上限 4096，超长＝2×上限＝8192
    const long = "u".repeat(8192);
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      // 步骤 2/3：search，断言 filters.user_id 原样带出（无长度校验、无拒绝）
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      await adapter.search("q", long);
      const filters = bodyOf(ff.calls[0]!).filters as Record<string, unknown>;
      expect(filters.user_id).toBe(long);
      expect((filters.user_id as string).length).toBe(8192);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
