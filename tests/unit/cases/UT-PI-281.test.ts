/**
 * Case ID: UT-PI-281  ·  STATUS: real
 *
 * 责任：可选参数 `graphragApiKey` 缺省/显式两态（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `字符串/路径/枚举输入` × `未知枚举`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-281.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig } from "./support/pi-runtime-fix.js";

describe("UT-PI-281 · PiRuntime.constructor · 字符串/路径/枚举输入 × 未知枚举", () => {
  it("treats an omitted graphrag key and an explicit one as the two distinct states", async () => {  // treats an omitted graphrag key and an explicit one as the two distinct states
    // 步骤 1a：缺省（undefined）—— 配了 doc_search 却没给 key ⇒ fail-fast
    const omitted = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", doc_search: { provider: "graphrag", api_key_secret_ref: "env:GRAPHRAG_API_KEY", base_url: "https://graphrag.example.com" } } }),
    });
    try {
      expect(omitted.error).toBeInstanceOf(Error);
      expect((omitted.error as Error).message).toBe("graphragApiKey required when identity.doc_search configured");
    } finally {
      await omitted.close();
    }

    // 步骤 1b：显式给了 key ⇒ adapter 被构造
    const explicit = await piConstructor({
      config: piConfig({ identity: { role: "developer", name: "alice:developer", doc_search: { provider: "graphrag", api_key_secret_ref: "env:GRAPHRAG_API_KEY", base_url: "https://graphrag.example.com" } } }),
      graphragApiKey: "explicit-key",
    });
    try {
      expect(explicit.error).toBeUndefined();
      expect(explicit.state("graphragAdapter")).toBeDefined();
    } finally {
      await explicit.close();
    }
  });
});
