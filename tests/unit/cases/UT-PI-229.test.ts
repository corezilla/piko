/**
 * Case ID: UT-PI-229  ·  STATUS: real
 *
 * 责任：可选参数 `options` 缺省/显式两态（mem0-client.ts:88）
 * 维度坐标：`search` × `纯函数/无副作用` × `未知枚举`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-229.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter, type Mem0SearchOptions } from "../../../src/mem0-client.js";
import { bodyOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-229 · search · 纯函数/无副作用 × 未知枚举", () => {
  it("treats an omitted options as identical to the explicit defaults", async () => {  // treats an omitted options as identical to the explicit defaults
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      const adapter = new Mem0Adapter("https://mem0.test", "key");
      // 步骤 1/2：三态——缺省 / 显式默认值 / 未知枚举值
      await adapter.search("q", "u");
      const omitted = bodyOf(ff.calls[0]!);

      await adapter.search("q", "u", { max_results: 5, filters: {} });
      const explicit = bodyOf(ff.calls[1]!);
      // 步骤 3：缺省态与显式默认值同构
      expect(explicit).toEqual(omitted);

      const unknown = { max_results: 5, filters: {}, unknown_option: "x" } as unknown as Mem0SearchOptions;
      await adapter.search("q", "u", unknown);
      // 未知枚举值不被拒绝：多余的 options 键被忽略，请求体与缺省态同构
      expect(bodyOf(ff.calls[2]!)).toEqual(omitted);

      // 未知 filter 键按 ISD 约定原样透传
      await adapter.search("q", "u", { filters: { unknown_enum: "v" } });
      expect(bodyOf(ff.calls[3]!).filters).toEqual({ user_id: "u", unknown_enum: "v" });
      expect(ff.calls.length).toBe(4);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
