/**
 * Case ID: UT-PI-280  ·  STATUS: real
 *
 * 责任：参数 `graphragApiKey: string` 的 `注入字符` 类（pi-runtime.ts:114）
 * 维度坐标：`PiRuntime.constructor` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-280.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { piConstructor, piConfig, piIdentity } from "./support/pi-runtime-fix.js";

describe("UT-PI-280 · PiRuntime.constructor · 字符串/路径/枚举输入 × 注入字符", () => {
  it("accepts a graphrag key with injection characters and passes it to the adapter verbatim", async () => {  // accepts a graphrag key with injection characters and passes it to the adapter verbatim
    // 步骤 1：注入字符
    const injected = "abc'; DROP TABLE tasks; --";
    const fx = await piConstructor({
      config: piConfig({ identity: piIdentity({ doc_search: {} }) }),
      graphragApiKey: injected,
    });
    try {
      // 步骤 2/3：断言被接受，adapter 拿到原样 key（只作 HTTP 头，不进 shell）
      expect(fx.error).toBeUndefined();
      const adapter = fx.state<{ apiKey: string }>("graphragAdapter");
      expect(adapter).toBeDefined();
      expect(adapter?.apiKey).toBe(injected);
    } finally {
      await fx.close();
    }
  });
});
