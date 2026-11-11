/**
 * Case ID: UT-PI-228  ·  STATUS: real
 *
 * 责任：参数 `options: Mem0SearchOptions` 的 `非法值` 类（mem0-client.ts:88）
 * 维度坐标：`search` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-228.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter, type Mem0SearchOptions } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-228 · search · 纯函数/无副作用 × 非法值", () => {
  it("forwards illegal options values instead of rejecting them", async () => {  // forwards illegal options values instead of rejecting them
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：非法值——max_results 是字符串 / filters 是 null / filters 是字符串
      const bad = {
        max_results: "abc",
        filters: null,
      } as unknown as Mem0SearchOptions;
      await adapter.search("q", "u", bad);
      // 步骤 3：既不抛 typed 错误也不拒绝——逐值对账请求体
      expect(bodyOf(ff.calls[0]!)).toEqual({ query: "q", filters: { user_id: "u" }, top_k: "abc" });

      const strFilters = { max_results: 5, filters: "str" } as unknown as Mem0SearchOptions;
      await adapter.search("q", "u", strFilters);
      // filters 是字符串时被展开成索引键
      expect(bodyOf(ff.calls[1]!).filters).toEqual({ user_id: "u", "0": "s", "1": "t", "2": "r" });

      const nanMax = { max_results: Number.NaN } as unknown as Mem0SearchOptions;
      await adapter.search("q", "u", nanMax);
      // NaN 不是 nullish → 保留；JSON.stringify 把 NaN 写成 null
      expect(bodyOf(ff.calls[2]!).top_k).toBeNull();
      expect(ff.calls.length).toBe(3);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
