/**
 * Case ID: UT-PI-214  ·  STATUS: real
 *
 * 责任：参数 `baseUrl: string` 的 `空` 类（mem0-client.ts:73）
 * 维度坐标：`Mem0Adapter.constructor` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-214.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { headersOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-214 · Mem0Adapter.constructor · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty baseUrl and builds the v3 path from it verbatim", async () => {  // accepts an empty baseUrl and builds the v3 path from it verbatim
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      // 步骤 1/2：baseUrl 三态——空串 / undefined / null；apiKey 取合法等价类
      const empty = new Mem0Adapter("", "key");
      await empty.search("q", "u");
      expect(ff.calls[0]!.url).toBe("/v3/memories/search/");
      expect(headersOf(ff.calls[0]!).Authorization).toBe("Token key");

      const undef = new Mem0Adapter(undefined as unknown as string, "key");
      await undef.search("q", "u");
      expect(ff.calls[1]!.url).toBe("undefined/v3/memories/search/");

      const nul = new Mem0Adapter(null as unknown as string, "key");
      await nul.search("q", "u");
      expect(ff.calls[2]!.url).toBe("null/v3/memories/search/");
      expect(ff.calls.length).toBe(3);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
