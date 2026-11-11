/**
 * Case ID: UT-PI-220  ·  STATUS: real
 *
 * 责任：参数 `query: string` 的 `空` 类（mem0-client.ts:88）
 * 维度坐标：`search` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-220.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-220 · search · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty query and forwards it without a client-side check", async () => {  // accepts an empty query and forwards it without a client-side check
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：query 三态——空串 / undefined / null
      await adapter.search("", "u");
      expect(bodyOf(ff.calls[0]!).query).toBe("");

      await adapter.search(undefined as unknown as string, "u");
      // undefined 被 JSON.stringify 丢掉 → body 里根本没有 query 键
      expect(Object.keys(bodyOf(ff.calls[1]!))).toEqual(["filters", "top_k"]);

      await adapter.search(null as unknown as string, "u");
      expect(bodyOf(ff.calls[2]!).query).toBeNull();
      expect(Object.keys(bodyOf(ff.calls[2]!))).toEqual(["query", "filters", "top_k"]);
      expect(ff.calls.length).toBe(3);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
