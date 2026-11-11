/**
 * Case ID: UT-PI-227  ·  STATUS: real
 *
 * 责任：参数 `options: Mem0SearchOptions` 的 `边界(上/下/零/空/满)` 类（mem0-client.ts:88）
 * 维度坐标：`search` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-227.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-227 · search · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("passes every boundary max_results through without bounds checking", async () => {  // passes every boundary max_results through without bounds checking
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：边界值——下界 1 / 上界 20 / 零 0 / 负数 -5（ISD：[1,20]，但客户端不二次校验）
      const bounds = [1, 20, 0, -5];
      for (const [i, max_results] of bounds.entries()) {
        await adapter.search("q", "u", { max_results });
        expect(bodyOf(ff.calls[i]!).top_k).toBe(max_results);
      }
      // 空 filters（边界：空）——只有 user_id，无任何额外过滤键
      await adapter.search("q", "u", { max_results: 5, filters: {} });
      expect(bodyOf(ff.calls[4]!).filters).toEqual({ user_id: "u" });
      expect(ff.calls.length).toBe(5);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
