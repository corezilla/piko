/**
 * Case ID: UT-PI-217  ·  STATUS: real
 *
 * 责任：参数 `apiKey: string` 的 `空` 类（mem0-client.ts:73）
 * 维度坐标：`Mem0Adapter.constructor` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-217.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter } from "../../../src/mem0-client.js";
import { headersOf, scriptedFetch } from "./support/a1-mem0-fix.js";

describe("UT-PI-217 · Mem0Adapter.constructor · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty apiKey and sends it as an empty Token credential", async () => {  // accepts an empty apiKey and sends it as an empty Token credential
    const ff = scriptedFetch([{ status: 200, body: "{}" }]);
    vi.stubGlobal("fetch", ff.fetch);
    try {
      // 步骤 1/2：apiKey 三态——空串 / undefined / null；baseUrl 取合法等价类
      const empty = new Mem0Adapter("https://mem0.test", "");
      await empty.search("q", "u");
      expect(headersOf(ff.calls[0]!).Authorization).toBe("Token ");

      const undef = new Mem0Adapter("https://mem0.test", undefined as unknown as string);
      await undef.search("q", "u");
      expect(headersOf(ff.calls[1]!).Authorization).toBe("Token undefined");

      const nul = new Mem0Adapter("https://mem0.test", null as unknown as string);
      await nul.search("q", "u");
      expect(headersOf(ff.calls[2]!).Authorization).toBe("Token null");
      expect(ff.calls.length).toBe(3);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
